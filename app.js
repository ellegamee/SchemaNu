// npm install express
const pptrFirefox = reqire("puppeteer");

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function waow() {
  const browser = await pptrFirefox.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(
    "https://web.skola24.se/timetable/timetable-viewer/norrkoping.skola24.se/Ebersteinska gymnasiet"
  );

  await sleep(1000);

  // 109
  for (i = 1; i < 109; i++) {
    // Open up list of rooms
    await page.click("div[data-identifier=SalSelection] > .w-arrow");
    await sleep(2000);

    // Click on a room
    await page.click(
      "div[data-identifier=SalSelection] > ul > li:nth-child(" + i + ") > a"
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
  }

  await browser.close();
}

waow();
