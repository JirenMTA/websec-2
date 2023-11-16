let Port = process.env.PORT || 5500;
let XMLHttpRequest = require('xhr2');
let http = require('http');
let path = require('path');
let express = require('express');
let app = express();
let server = http.Server(app);
let HTMLParser = require('node-html-parser');
let fs = require('fs');

app.use(express.static(__dirname));

app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(Port, () => {
    console.log('Server listening on port 5500');
    //getGroupsAndTeacher();
});

app.get('/rasp', (req, res) => {
   res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/rasp', (req, res) => {
    console.log("Call api:" + req.url.replace('/api', ''));
    let url = "https://ssau.ru"+ req.url.replace('/api', '');
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.send(null);
    request.onreadystatechange = () =>
    {
        if (request.readyState == 4)
        {
            let data = HTMLParser.parse(request.responseText);
            res.send(analisData(data));
        }
    }
});

function analisData(data)
{
    let schedule = {
        dates: [],
        dayOfSchedule: [],
        Times: [],
        currentWeek: 17,
        color: [],
        currentGroup: ""
    };
    if (data.querySelector(".week-nav-current_week") != null)
        schedule.currentWeek = parseInt(data.querySelector(".week-nav-current_week").innerText);
    if (data.querySelector(".info-block__title") != null)
        schedule.currentGroup = data.querySelector(".info-block__title").innerText;
    console.log(schedule.currentWeek);
    for (let cell of data.querySelectorAll(".schedule__time"))
        schedule.Times.push(cell.innerText);
    for (let cell of data.querySelectorAll(".schedule__item"))
    {
        if (cell.querySelector(".schedule__head-weekday"))
            schedule.dates.push(cell.innerText.trim());
        else 
        {
            if (cell.querySelector(".schedule__lesson"))
            {
                let subject = cell.querySelector(".schedule__discipline").innerText.trim();
                if (cell.querySelector(".lesson-color-type-1"))
                    schedule.color.push("#43A047");
                else if (cell.querySelector(".lesson-color-type-2"))
                    schedule.color.push("#443FA2");
                else if (cell.querySelector(".lesson-color-type-3"))
                    schedule.color.push("#FF3D00");
                else if (cell.querySelector(".lesson-color-type-4"))
                    schedule.color.push("#F0AD4E");
                let teacherElement = cell.querySelector(".schedule__teacher > .caption-text");
                let teacher;
                let place = cell.querySelector(".schedule__place").innerText.trim();
                if (teacherElement!= null)
                {
                    teacher = JSON.stringify({"name": teacherElement.innerText.trim(), "link": teacherElement.getAttribute("href")});
                }
                else
                    teacher = null;
                let groupsElement = cell.querySelectorAll(".schedule__group");
                let groups = [];
                if (groupsElement!= null)
                    for (let group of groupsElement)
                    {
                        groupLink = group.getAttribute("href");
                        groupName = group.innerText.trim();
                        groups.push(JSON.stringify({
                            "name": groupName,
                            "link": groupLink
                        }));
                    }
                schedule.dayOfSchedule.push({
                    "subject": subject,
                    "place": place,
                    "teacher": teacher,
                    "groups": groups});
            }
            else
            {
                schedule.dayOfSchedule.push({"subject" : null});
                schedule.color.push(null);
            }
        }
    }
    schedule.dayOfSchedule = schedule.dayOfSchedule.slice(1, schedule.dayOfSchedule.length);
    schedule.color = schedule.color.slice(1, schedule.color.length);
    return JSON.stringify(schedule);
}


function testRequest()
{
    let url = "https://ssau.ru/rasp?groupId=531873998"
    let req = new XMLHttpRequest();
    req.open("GET", url, true);
    req.send(null);
    
    req.onreadystatechange = () =>
    {
        if (req.readyState == 4)
        {
            let schedule = {
                dates: [],
                dayOfSchedule: [],
                Times: [],
                currentWeek: 17,
                color: []
            };
            let data = HTMLParser.parse(req.responseText);

            if (data.querySelector(".week-nav-current_week").innerText)
                currentWeek = parseInt(data.querySelector(".week-nav-current_week").innerText);
            console.log(currentWeek);
            //console.log(data.querySelector(".week-nav-current_week").innerText);
            for (let cell of data.querySelectorAll(".schedule__time"))
                schedule.Times.push(cell.innerText);
            for (let cell of data.querySelectorAll(".schedule__item"))
            {
                //console.log(cell.innerHTML);
                if (cell.querySelector(".schedule__head-weekday"))
                    schedule.dates.push(cell.innerText.trim());
                else 
                {
                    if (cell.querySelector(".schedule__lesson"))
                    {
                        let subject = cell.querySelector(".schedule__discipline").innerText.trim();
                        if (cell.querySelector(".lesson-color-type-1"))
                            schedule.color.push("#43A047");
                        else if (cell.querySelector(".lesson-color-type-2"))
                            schedule.color.push("#443FA2");
                        else if (cell.querySelector(".lesson-color-type-3"))
                            schedule.color.push("#FF3D00");
                        else if (cell.querySelector(".lesson-color-type-4"))
                            schedule.color.push("#F0AD4E");
                        let teacherElement = cell.querySelector(".schedule__teacher > .caption-text");
                        let teacher;
                        let place = cell.querySelector(".schedule__place").innerText.trim();
                        if (teacherElement!= null)
                        {
                            teacher = JSON.stringify({"name": teacherElement.innerText.trim(), "link": teacherElement.getAttribute("href")});
                        }
                        else
                            teacher = null;
                        let groupsElement = cell.querySelectorAll(".schedule__group");
                        let groups = [];
                        if (groupsElement!= null)
                            for (let group of groupsElement)
                            {
                                groupLink = group.getAttribute("href");
                                groupName = group.innerText.trim();
                                groups.push(JSON.stringify({
                                    "name": groupName,
                                    "link": groupLink
                                }));
                            }
                        schedule.dayOfSchedule.push({
                            "subject": subject,
                            "place": place,
                            "teacher": teacher,
                            "groups": groups});
                    }
                    else
                    {
                        schedule.dayOfSchedule.push({"subject" : null});
                        schedule.color.push(null);
                    }
                }
            }
            schedule.dayOfSchedule = schedule.dayOfSchedule.slice(1, schedule.dayOfSchedule.length);
            schedule.color = schedule.color.slice(1, schedule.color.length);
        }
    }
}

app.get('/getGroupsAndTeachers', (req, res) => {
    //getGroupsAndTeacher();
    res.sendFile(path.join(__dirname, 'groupAndTeachers.json'));
});

function getGroupsAndTeacher() {
    {
        let result = { groups: [], teachers: [] };
        let count = 0;
        let allHTMLResponses = [];
    
        for (let i = 1; i < 6; i++) {
            let request = new XMLHttpRequest();
            let url = "https://ssau.ru/rasp/faculty/492430598?course=" + i;
            request.open("GET", url, true);
            request.send(null);
            request.onreadystatechange = () => {
                if (request.readyState == 4) {
                    let root = HTMLParser.parse(request.responseText);
                    let groups = root.querySelectorAll(".group-catalog__groups > a");
                    for (let group of groups) {
                        const id = group.getAttribute("href").replace(/\D/g, '');
                        result.groups.push({ name: group.innerText, link: `/rasp?groupId=${id}` })
                    }
                }
            };
        }
        for (let i = 1; i < 120; i++) {
            let request = new XMLHttpRequest();
            let url = "https://ssau.ru/staff?page=" + i;
            request.open("GET", url, true);
            request.send(null);
            request.onreadystatechange = () => {
                if (request.readyState == 4) {
                    count++;
                    allHTMLResponses.push(request.responseText);
                    if (count === 115) {
                        for (let teacher of allHTMLResponses) {
                            let root = HTMLParser.parse(teacher);
                            let teachers = root.querySelectorAll(".list-group-item > a");
                            for (let teacher of teachers) {
                                const id = teacher.getAttribute("href").replace(/\D/g, '');
                                result.teachers.push({ name: teacher.innerText, link: `/rasp?staffId=${id}` })
                            }
                        }
                        console.log('ok');
                        fs.writeFileSync("groupAndTeachers.json", JSON.stringify(result));
                    }
                }
            };
        }
    }
}