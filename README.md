FortiBody is presently an app for my personal use for now. 

While it is barely usable at the moment and looks atrocious, I intend for this to be quite an ambitious project and this is inspired by some combination of BodBot and MyFitnessPal

The Design Doc:

* Be able to have user profiles
* Save data locally. Perhaps we will have something you can opt into later, but first and foremost, your data is your data.
   * I also recognize that I am a noob, and while I haven't yet open-sourced this application, I may make mistakes and use a library or service unintentionally that abuses user data. As soon as I am aware, or the gracious users point it out, steps will begin to be taken to correct it.
  
* Use machine learning 
  * Using tensorflow.js (or some other library) , its going to take inputs, and calculate what type of exercises a user should do based on a few factors whilst training a model unique to the individual: 
    * The users gender
    * The users age 
    * The users BMI, and relative to how it is trending 
    * The users weight
    * efficiency over a series of exercises that will be updated over time
      * I would like to use computer vision for this to be able to track body movement 
      * It will also be able to able to adjust by taking in measurements for the user's flexibility 
      
    
    * The user's diet:
      * This app will be able to track what the user consumes on a daily basis, and be able to update it's protocol based on what the user did in the past.
      * TODO
       * Create a calorie counter module
      
    ~~* The user's sleep
        * Optional, I would think
          * I am unaware of any devices that can track this well, save for perhaps smart watches?
          * We could also use-built in apps for smartphones that already track this
            * It might train a unique model that contrasts and compares different apps~~
    
    * The user's mental health/state
      * TODO
       * something like a meditation module
      
    * The user's activity
      * It is unclear to me at this time how I will track this. 
      * I will have to ask the user about the exercises that they are currently doing
      * Track the number of steps they take
      * Use fitness watches to track HR
      
* In the UI, there will also be a page available for looking at studies for the more curious-minded. 

## CURRENT OBJECTIVE:
* Add a calorie tracker
  * Revisit BMR Calculator
* Add love letters to components
* **ADD STYLES** 
* ~~Add a screen for differentiating between powerlifting and not powerlifting~~
* ~~Add a fasting timer~~
