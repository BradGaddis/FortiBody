function goToSettings(name, listedKey, groupedKey, navigation) {
    // navigate to settings screen and pass arguments
    navigation.navigate('Exercise Settings', {
      name: name,
      listedKey: listedKey,
      groupedKey: groupedKey,
    });
  }

  export default goToSettings;