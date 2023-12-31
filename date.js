exports.getDate = function (){
    const today = new Date();
    const currentDay = today.getDay();
    const options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    };
    const day = today.toLocaleDateString("en-US", options);
    return day;
};
