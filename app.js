const pptrFirefox = require("puppeteer");
var glob = require("glob")
var merge = require("easy-pdf-merge")
var fs = require("fs")

const express = require('express')
const app = express()
const port = 3000
app.use(express.json()) 

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}

app.get("/", function(req, res){
    res.sendFile(__dirname + "/index.html")
})

app.get("/rum", async function(req, res) {
    const browser = await pptrFirefox.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(
        "https://web.skola24.se/timetable/timetable-viewer/norrkoping.skola24.se/Ebersteinska gymnasiet"
    );
    await sleep(2000);

    // Open up list of rooms
    await page.click("div[data-identifier=SalSelection] > .w-arrow");
    await sleep(2000);
    rooms = await page.evaluate(() => Array.from(document.querySelectorAll('div[data-identifier="SalSelection"] >  ul > li'), (element) => element.getAttribute("data-text")))
    
    rooms = rooms.filter(function(room) {
        return room.charAt(0) == "1" || room.charAt(0) == "2" || room.charAt(0) == "3"|| room.charAt(0) == "4";
    })
    console.log(rooms)
    res.send(JSON.stringify(rooms))
})

app.get("/veckor", async function(req, res) {
  const browser = await pptrFirefox.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(
      "https://web.skola24.se/timetable/timetable-viewer/norrkoping.skola24.se/Ebersteinska gymnasiet"
  );
  await sleep(2000);

  // Open up list of weeks
  await page.click("div[data-identifier=weekSelection] > .w-arrow");
  await sleep(2000);
  weeks = await page.evaluate(() => Array.from(document.querySelectorAll('div[data-identifier="weekSelection"] >  ul > li'), (element) => element.getAttribute("data-text")))
  
  console.log(weeks)
  res.send(JSON.stringify(weeks))
})

function downloadpdf(rumname, week, index){
    return new Promise(async function(resolve, reject){
        await sleep(index * 2000);
        
        const browser = await pptrFirefox.launch({ headless: true });
        const page = await browser.newPage();

        await page.goto(
            "https://web.skola24.se/timetable/timetable-viewer/norrkoping.skola24.se/Ebersteinska gymnasiet"
        );
        await sleep(3000);

        // Open up list of rooms
        await page.click("div[data-identifier=SalSelection] > .w-arrow");
        await sleep(2000);

        // Click on a room
        await page.click(
        `div[data-identifier=SalSelection] > ul > li[data-text="${rumname}"] > a`
        );
        await sleep(3000);

        // Open up list of weeks
        await page.click("div[data-identifier=weekSelection] > .w-arrow");
        await sleep(2000);

        // Click on a week
        await page.click(
        `div[data-identifier=weekSelection] > ul > li[data-text="${week}"] > a`
        );
        await sleep(3000);

        // Click on the open menu icon
        await page.click(
        "body > div.w-widget-timetable-viewer > div.w-page-header > div > div > div > div:nth-child(1) > button"
        );
        await sleep(2000);

        // Click on download button
        await page.click(
        "body > div.w-widget-timetable-viewer > div.w-page-header > div > div > div > div:nth-child(1) > ul > li:nth-child(1) > a > div"
        );
        await sleep(2000);

        // Click on hämta pdf button
        await page.click(
        "body > div.w-widget-timetable-viewer > div.w-page-content > div > div.w-modal.w-print.open > div > div > div.w-modal-body > div > button:nth-child(4)"
        );
        await sleep(2000);

        // Click on avbryt button
        await page.click(
        "body > div.w-widget-timetable-viewer > div.w-page-content > div > div.w-modal.w-print.open > div > div > div.w-modal-body > div > button:nth-child(5)"
        );
        await sleep(2000);
        await browser.close();
        resolve()
    })
}

app.post("/download_pdf", async function(req, res) {
    console.log(req.body)

    actions = []

    req.body[0].forEach(async (rumname, index) => {
        actions.push(downloadpdf(rumname, req.body[1], index))
    });

    await Promise.all(actions)

    glob("C:/Users/ELLEGAME/Downloads/Schema*.pdf", function (er, files) {
        console.log(files)
        if (files.length > 1){
            merge(files, "C:/Users/ELLEGAME/Desktop/Scheman/combined_schema.pdf", function (error) {
                if (error){
                    console.log(error)
                }

                else{
                    console.log("It worked to combine!")
                    files.forEach(function (file) {
                        fs.unlinkSync(file)
                    })
                }
            })
        }

        else{
            fs.renameSync(files[0], "C:/Users/ELLEGAME/Desktop/Scheman/combined_schema.pdf")
        }
    })
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))