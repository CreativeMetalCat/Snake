function onPageLoad()
{
    let req = new XMLHttpRequest();
    req.open("GET", "./levels/levels.json", false);
    req.send(null);
    let levels = JSON.parse(req.responseText);

    let optionMenu = document.getElementById("levels");
    for(let i =0;i<levels.levels.length;i++)
    {
        optionMenu.innerHTML += '<option value="'+levels.levels[i].path+'">'+levels.levels[i].name+'</option>';
    }
}