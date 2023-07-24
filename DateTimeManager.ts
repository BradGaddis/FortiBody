let today = new Date();
let day = today.getDate();
let month = today.getMonth() + 1;
let year = today.getFullYear();

let months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
let monthName = months[month - 1];


export function FormattedDate()  {
    // this is probably not the idea way to manage my memory. I will have to come up with that later...
    return monthName + " " + day + ", " + year;
}