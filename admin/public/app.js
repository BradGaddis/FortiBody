const { createApp, ref, reactive, onMounted, onUnmounted } = Vue;

const API_BASE = 'http://localhost:3000';

const app = createApp({
  setup() {
    const tabs = ['exercises', 'routines', 'modules'];
    const currentTab = ref('exercises');
    const loading = ref(true);
    const connected = ref(false);
    const appConnected = ref(false);
    const appExercises = ref([]);
    const showAddForm = ref(false);
    const editingItem = ref(null);
    const ws = ref(null);

    const items = reactive({
      exercises: [],
      routines: [],
      modules: []
    });

    const formData = reactive({
      name: '',
      category: 'strength',
      equipment: '',
      muscleGroups: '',
      instructions: '',
      description: '',
      exercises: '',
      routines: '',
      tags: ''
    });

    const fetchItems = async () => {
      try {
        const [exercises, routines, modules] = await Promise.all([
          axios.get(`${API_BASE}/api/exercises`),
          axios.get(`${API_BASE}/api/routines`),
          axios.get(`${API_BASE}/api/modules`)
        ]);
        items.exercises = exercises.data;
        items.routines = routines.data;
        items.modules = modules.data;
        loading.value = false;
      } catch (error) {
        console.error('Failed to fetch items:', error);
        loading.value = false;
      }
    };

    const addItem = async (entity) => {
      try {
        const payload = { ...formData };

        if (entity === 'exercises') {
          payload.muscleGroups = formData.muscleGroups.split(',').map(s => s.trim()).filter(Boolean);
        } else if (entity === 'routines') {
          payload.exercises = formData.exercises.split(',').map(s => s.trim()).filter(Boolean);
          payload.category = formData.category || 'flexibility';
        } else if (entity === 'modules') {
          payload.routines = formData.routines.split(',').map(s => s.trim()).filter(Boolean);
          payload.exercises = formData.exercises.split(',').map(s => s.trim()).filter(Boolean);
          payload.tags = formData.tags.split(',').map(s => s.trim()).filter(Boolean);
        }

        await axios.post(`${API_BASE}/api/${entity}/add`, payload);
        await fetchItems();
        showAddForm.value = false;
        resetForm();
      } catch (error) {
        console.error('Failed to add item:', error);
      }
    };

    const editItem = (entity, item) => {
      editingItem.value = { ...item };

      if (entity === 'exercises') {
        editingItem.value.muscleGroups = item.muscleGroups?.join(', ') || '';
      } else if (entity === 'routines') {
        editingItem.value.exercises = item.exercises?.join(', ') || '';
      } else if (entity === 'modules') {
        editingItem.value.routines = item.routines?.join(', ') || '';
        editingItem.value.exercises = item.exercises?.join(', ') || '';
        editingItem.value.tags = item.tags?.join(', ') || '';
      }
    };

    const saveEdit = async () => {
      try {
        const payload = { ...editingItem.value };

        if (currentTab.value === 'exercises') {
          payload.muscleGroups = editingItem.value.muscleGroups.split(',').map(s => s.trim()).filter(Boolean);
        } else if (currentTab.value === 'routines') {
          payload.exercises = editingItem.value.exercises.split(',').map(s => s.trim()).filter(Boolean);
        } else if (currentTab.value === 'modules') {
          payload.routines = editingItem.value.routines.split(',').map(s => s.trim()).filter(Boolean);
          payload.exercises = editingItem.value.exercises.split(',').map(s => s.trim()).filter(Boolean);
          payload.tags = editingItem.value.tags.split(',').map(s => s.trim()).filter(Boolean);
        }

        await axios.put(`${API_BASE}/api/${currentTab.value}/${editingItem.value.id}`, payload);
        await fetchItems();
        editingItem.value = null;
      } catch (error) {
        console.error('Failed to save edit:', error);
      }
    };

    const deleteItem = async (entity, id) => {
      if (!confirm('Are you sure you want to delete this item?')) return;

      try {
        await axios.delete(`${API_BASE}/api/${entity}/${id}`);
        await fetchItems();
      } catch (error) {
        console.error('Failed to delete item:', error);
      }
    };

    const exportItem = (entity, item) => {
      const data = JSON.stringify(item, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${entity.slice(0, -1)}-${item.id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    const resetForm = () => {
      formData.name = '';
      formData.category = 'strength';
      formData.equipment = '';
      formData.muscleGroups = '';
      formData.instructions = '';
      formData.description = '';
      formData.exercises = '';
      formData.routines = '';
      formData.tags = '';
    };

    const connectWebSocket = () => {
      ws.value = new WebSocket(`ws://${window.location.host}`);

      ws.value.onopen = () => {
        connected.value = true;
        ws.value.send(JSON.stringify({ type: 'identify', role: 'admin' }));
        console.log('WebSocket connected');
      };

      ws.value.onmessage = (event) => {
        const { type, payload } = JSON.parse(event.data);

        if (type === 'app_status') {
          appConnected.value = payload.connected;
          appExercises.value = payload.exercises || [];
          return;
        }

        const entity = type.replace('_updated', '');
        if (items[entity] !== undefined) {
          items[entity] = payload;
        }
      };

      ws.value.onclose = () => {
        connected.value = false;
        appConnected.value = false;
        console.log('WebSocket disconnected');
        setTimeout(connectWebSocket, 3000);
      };

      ws.value.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    };

    onMounted(() => {
      fetchItems();
      connectWebSocket();
    });

    onUnmounted(() => {
      if (ws.value) {
        ws.value.close();
      }
    });

    return {
      tabs,
      currentTab,
      loading,
      connected,
      appConnected,
      appExercises,
      showAddForm,
      editingItem,
      items,
      formData,
      addItem,
      editItem,
      saveEdit,
      deleteItem,
      exportItem
    };
  }
});

app.mount('#app');
