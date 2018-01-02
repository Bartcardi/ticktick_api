const puppeteer = require('puppeteer');
const CREDS = require('./creds');
const fs = require('fs');
const http = require('http');
const url = require('url');
const { DEBUG, HEADFUL, CHROME_BIN, PORT } = process.env;

let browser;
let page;
require('http').createServer(async (req, res) => {
  const { host } = req.headers;
  const cType = req.headers['content-type'];
  console.log(cType);
  // console.log(req);
  var parsedUrl = url.parse(req.url, true);
  //console.log(parsedUrl);
  var reqUrl = parsedUrl.pathname;
  var reqMethod = req.method;

  if (reqUrl == '/'){
    res.writeHead(200, {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public,max-age=31536000',
    });
    res.end(fs.readFileSync('index.html'));
    return;
  }

  if (reqUrl == '/login'){
    if (!browser) {
      console.log('🚀 Launch browser!');
      browser = await puppeteer.launch({headless: false});
    }
    if (!page) {
      page = await browser.newPage();
      await page.setViewport({width: 1920, height: 1080 });
      await page.goto('https://ticktick.com/signin');
      res.writeHead(200, {
        'content-type': 'application/json',
      });
      res.end(JSON.stringify({
        status: 'Signing in',
      }, null, '\t'));
      
      await page.screenshot( { path: 'screenshots/ticktick_login.png' });
      
      const USERNAME_SELECTOR = '#username';
      const PASSWORD_SELECTOR = '#password';
      const BUTTON_SELECTOR = '#submit-btn';

      await page.click(USERNAME_SELECTOR);
      await page.keyboard.type(CREDS.username);

      await page.click(PASSWORD_SELECTOR);
      await page.keyboard.type(CREDS.password);

      await page.click(BUTTON_SELECTOR);

      await page.waitFor(5*1000);
      await page.screenshot({ path: 'screenshots/ticktick_logged_in.png'});
    }

    //if (page._frameManager._mainFrame._url == 'https://ticktick.com/signin'){
    //}
      else {
        console.log(page._frameManager._mainFrame._url)
        res.writeHead(200, {
          'content-type': 'application/json',
        });
        res.end(JSON.stringify({
          status: 'Already logged in.',
        }, null, '\t'));
        await page.screenshot({ path: 'screenshots/ticktick_already_logged_in.png'});
      }
    return;
  }

  if (reqUrl == '/get_lists'){
    const html = await page.evaluate(() => {
      const FOLDER_SELECTOR = '#project-ul > li > div > div > a > span.l-title.group-title.project-title';
      var thtml = {};
      elem = document.querySelectorAll(FOLDER_SELECTOR);
      elem.forEach(e => console.log(e.innerHTML));
      return thtml;
    });
    console.log(html);
    res.writeHead(200, {
      'content-type': 'application/json',
    });
    res.end(JSON.stringify({
      status: html
    }, null, '\t'));
  }

  if (reqUrl == '/add_task'){
    if (reqMethod == 'POST' && cType == 'application/json'){
      var body = '';
      req.on('data', function (data) {
        body += data;
        // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
        if (body.length > 1e6) { 
          // FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
          request.connection.destroy();
        }
      });
      var POST;
      req.on('end', async function () {
        POST = JSON.parse(body);
        //console.log(JSON.stringify(POST));
        if (typeof POST.task !== 'undefined'){
          var t = POST.task;
          res.writeHead(200, {
            'content-type': 'application/json',
          });
          res.end(JSON.stringify({
            status: 'Adding task '+t
          }, null, '\t'));
          console.log(POST.task);
          
          // MOVE BELOW OUT OF req.on context!!!!!
          const ADD_TASK_SELECTOR = '#add-task';
          await page.click(ADD_TASK_SELECTOR);
          //await page.waitFor(1000);
          const CHANGE_LIST_SELECTOR = '#add-task > div.preset.tl-q-preset > div.preset-list.dropdown > a > svg';
          await page.click(CHANGE_LIST_SELECTOR);
          //await page.screenshot({ path: 'screenshots/ticktick_clicked_add_task_.png'});
          const INBOX_SELECTOR = '#add-task > div.preset.tl-q-preset > div.preset-list.dropdown.open > div > div > ul > li.active > a'
          await page.waitForSelector(INBOX_SELECTOR);
          await page.click(INBOX_SELECTOR);
          await page.click(CHANGE_LIST_SELECTOR);
          await page.keyboard.type(t);
          :await page.keyboard.press('Enter');
          console.log('task '+ t +' added')
          return;
        } else{
          console.log('No task specified');
          res.writeHead(200, {
            'content-type': 'application/json',
          });
          res.end(JSON.stringify({
            status: 'No task specified.',
          }, null, '\t'));
          return;
        }
      });
    } else {
      console.log('Not a valid request');
      res.writeHead(200, {
        'content-type': 'application/json',
      });
      res.end(JSON.stringify({
        status: 'Not a valid request.',
      }, null, '\t'));
      return;
    }
  }

}).listen(PORT || 3000);

process.on('SIGINT', () => {
  if (browser) browser.close();
  process.exit();
});

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at:', p, 'reason:', reason);
});

