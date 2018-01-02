# ticktick_api
Workaround to expose ticktick functionality via REST API.

## Introduction
[TickTick](https://ticktick.com) is a great ToDo and productivity platform with various client apps. Unfortunately, the
platform does not support connecting external services via an API. This repository demonstrates how to set up a DIY API to
TickTick via node and chrome headless browser. This repository is a work in progress and more detailed instructions will follow.
Feel free to open an issue with any questions.

## Getting started
Using this tool requires nodejs yarn. I have only tested with Node `8.9.3`.

### Installation
```shell
yarn install
```
Create a creds.js file in the root folder containing your TickTick login credentials:

```javascript
module.exports = {
  username: '<TICKTICK_USERNAME>',
  password: '<TICKTICK_PASSWORD>'
};
```


### Usage
```shell
yarn start
```
Then do an HTTP request to `localhost:3000/login` to login to TickTick. To add a task to your inbox perform a JSON POST request to `localhost:3000/add_task` with body:

```json
{
"task": "YOUR TASK"
}
```
