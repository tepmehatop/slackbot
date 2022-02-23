const { App } = require('@slack/bolt');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

(async () => {
  await app.start(process.env.PORT || 8000);

  console.log('⚡️ Bolt app is running!');
})();

// Listens to incoming messages that contain "hello"
app.message('hello', async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  await say({
    blocks: [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `Hey there <@${message.user}>!`
        },
        "accessory": {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Click Me"
          },
          "action_id": "button_click"
        }
      }
    ],
    text: `Hey there <@${message.user}>!`
  });
});

app.action('button_click', async ({ body, ack, say }) => {
  // Acknowledge the action
  await ack();
  await say(`<@${body.user.id}> clicked the button`);
});


// Listen for a slash command invocation
app.command('/ticket', async ({ ack, body, client, logger }) => {
  // Acknowledge the command request
  await ack();

  try {
    // Call views.open with the built-in client
    const result = await client.views.open({
      // Pass a valid trigger_id within 3 seconds of receiving it
      trigger_id: body.trigger_id,
      // View payload

      view: {
        "type": "modal",
        "callback_id": "ticket-submit",
        "title": {
          "type": "plain_text",
          "text": "App menu",
          "emoji": true
        },
        "submit": {
          "type": "plain_text",
          "text": "Submit",
          "emoji": true
        },
        "close": {
          "type": "plain_text",
          "text": "Cancel",
          "emoji": true
        },
        "blocks": [
          {
            "type": "section",
            "block_id": "service_type",
            "text": {
              "type": "mrkdwn",
              "text": ":gear: *Релиз cервиса*"
            },
            "accessory": {
              "type": "static_select",
              "placeholder": {
                "type": "plain_text",
                "text": "Выбрать сервис",
                "emoji": true
              },
              "options": [
                {
                  "text": {
                    "type": "plain_text",
                    "text": "Frontend Новостей",
                    "emoji": true
                  },
                  "value": "value-0"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "Webhook Новостей",
                    "emoji": true
                  },
                  "value": "value-1"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "Картинкель Новостей",
                    "emoji": true
                  },
                  "value": "value-3"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "Процессинг Новостей",
                    "emoji": true
                  },
                  "value": "value-4"
                }
              ]
            }
          },
          {
            "type": "section",
            "block_id": "selected_date",
            "text": {
              "type": "mrkdwn",
              "text": "Укажите дату релиза"
            },
            "accessory": {
              "type": "datepicker",
              "placeholder": {
                "type": "plain_text",
                "text": "Select a date",
                "emoji": true
              },
              "action_id": "datepicker-action"
            }
          },
          {
            "type": "divider"
          },
          {
            "type": "input",
            "block_id": "release_link",
            "element": {
              "type": "plain_text_input",
              "action_id": "action_release_link"
            },
            "label": {
              "type": "plain_text",
              "text": "Укажите ссылку на релизный тикет",
              "emoji": true
            }
          },
          {
            "type": "input",
            "block_id": "at_link",
            "element": {
              "type": "plain_text_input",
              "action_id": "action_AT_link"
            },
            "label": {
              "type": "plain_text",
              "text": "Укажите ссылку на AT отчет",
              "emoji": true
            }
          },
          {
            "type": "input",
            "block_id": "manual_test_link",
            "element": {
              "type": "plain_text_input",
              "action_id": "action_manual_runTest_link"
            },
            "label": {
              "type": "plain_text",
              "text": "Укажите ссылку на ручной прогон",
              "emoji": true
            }
          },
          {
            "type": "section",
            "text": {
              "type": "plain_text",
              "text": "Ссылки на баги формат (ID задачи Название)",
              "emoji": true
            }
          },
          {
            "type": "input",
            "block_id": "blockers_links",
            "element": {
              "type": "plain_text_input",
              "placeholder": {
                "type": "plain_text",
                "text": "Пример: VC-1111 Ошибка при нажатии на красную кнопку",
                "emoji": true
              },
              "multiline": true,
              "action_id": "action_blockers_link"
            },
            "label": {
              "type": "plain_text",
              "text": "Ссылки на Блокеры",
              "emoji": true
            }
          },
          {
            "type": "input",
            "block_id": "critical_links",
            "element": {
              "type": "plain_text_input",
              "multiline": true,
              "action_id": "action_critical_link"
            },
            "label": {
              "type": "plain_text",
              "text": "Ссылки на Криты",
              "emoji": true
            }
          },
          {
            "type": "input",
            "block_id": "user_selected_qa",
            "element": {
              "type": "multi_users_select",
              "placeholder": {
                "type": "plain_text",
                "text": "Select users",
                "emoji": true
              },
              "action_id": "multi_users_select-action"
            },
            "label": {
              "type": "plain_text",
              "text": "Кто проводил тестирование?",
              "emoji": true
            }
          }
        ]
      }
    });
    logger.info(result);
  }
  catch (error) {
    logger.error(error);
  }
});



app.view('ticket-submit', async ({ ack, body, view, client }) => {
  // Acknowledge the action
  await ack();
  console.log(JSON.stringify(body));//see the data getting passed
  let msg = '';

  const user = body['user']['id'];
  const name = body['user']['username'];
  const values = view.state.values;
  const results = values['blockers_links']['action_blockers_link']['value'];


  if (results){
    msg = 'Your update was successful.' + results
  } else {
    msg = 'I am a failure but I do not know why.' + results
  }

  //message the user
  try {
    await client.chat.postMessage({
      channel: user,
      blocks: [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": msg + `Трулю лю ther>!`
          },
          "accessory": {
            "type": "button",
            "text": {
              "type": "plain_text",
              "text": "Click Me"
            },
            "action_id": "button_click"
          }
        }
      ],
      text: `Шалость удалась there >!` + msg
    });
  }
  catch (error){
    console.error(error);
  }

});
