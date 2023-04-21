// BMRPage.js
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';

const BMRPage = () => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [bmr, setBmr] = useState(null);

  const calculateBMR = (e) => {
    e.preventDefault();
    const bmrValue = 10 * weight + 6.25 * height - 5 * age + 5;
    setBmr(bmrValue);
  };

  return (
    <>
      <Helmet>
        <title>BMR Calculator</title>
        <meta name="description" content="Calculate your Basal Metabolic Rate" />
      </Helmet>
      <h1>BMR Calculator</h1>
      <form onSubmit={calculateBMR}>
        <label>
          Weight (kg):
          <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
        </label>
        <label>
          Height (cm):
          <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
        </label>
        <label>
          Age:
          <input type="number" value={age} onChange={(e) => setAge(e.target.value)} />
        </label>
        <button type="submit">Calculate BMR</button>
      </form>
      {bmr && <p>Your BMR is: {bmr} calories/day</p>}
    </>
  );
};

export default BMRPage;