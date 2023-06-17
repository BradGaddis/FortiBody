// BMRPage.js
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';

const BMRPage = () => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [bmr, setBmr] = useState(null);
  const [metric, setMetric] = useState('metric');


  const calculateBMRMetric = (e) => {
    e.preventDefault();
    const bmrValue = 10 * weight + 6.25 * height - 5 * age + 5;
    setBmr(bmrValue);
  };

  const calculateBMRImperial = (e) => {
    e.preventDefault();
    const bmrValue = 4.536 * weight + 15.88 * height - 5 * age + 5;
    setBmr(bmrValue);
  };

  const toggleUnit = () => {
    if (metric === 'metric') {
      setMetric('imperial');
    } else {
      setMetric('metric');
    }
  };


  return (
    <>
      <Helmet>
        <title>BMR Calculator</title>
        <meta name="description" content="Calculate your Basal Metabolic Rate" />
      </Helmet>
      <h1>BMR Calculator</h1>

      {<p>you are working in { <select value={metric} onChange={toggleUnit}>
        <option value="imperial">imperial</option>
        <option value="metric">metric</option>
      </select>} units</p>}
      
      <form onSubmit={ metric == "metric" ? calculateBMRMetric : calculateBMRImperial}>
        <label>
          Weight ({metric == "metric" ? "kg" : "lbs"}):
          <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
        </label>
        <br />
        <label>
          Height ({metric == "metric" ? "cm" : "in"}):
          <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
        </label>
        <br />
        <label>
          Age:
          <input type="number" value={age} onChange={(e) => setAge(e.target.value)} />
        </label>
        <br />
        <button type="submit">Calculate BMR</button>
      </form>
      {bmr && <p>Your BMR is: {bmr} calories/day</p>}
    </>
  );
};

export default BMRPage;