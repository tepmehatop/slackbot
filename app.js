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
  const serviceName = values['service_type']['selected_option']['value'];
  const selectedDate = values['selected_date']['datepicker-action']['selected_date'];



  const blockerLink = values['blockers_links']['action_blockers_link']['value'];



  //message the user
  try {
    await client.chat.postMessage({
      channel: user,
      "blocks": [
        {
          "type": "header",
          "text": {
            "type": "plain_text",
            "text": ":rocket:  Release summary report  :rocket:"
          }
        },
        {
          "type": "context",
          "elements": [
            {
              "text": "*"+ selectedDate +"* |  "+ serviceName + " релиз новостей 1.18.3",
              "type": "mrkdwn"
            }
          ]
        },
        {
          "type": "divider"
        },
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "Командой тестирования был проведен регресс усройств *SberTime, SberBox и Portal*, ниже подготовлен отчет о найденых дефектах."
          }
        },
        {
          "type": "actions",
          "elements": [
            {
              "type": "button",
              "text": {
                "type": "plain_text",
                "text": "Релизный тикет",
                "emoji": true
              },
              "style": "primary",
              "value": "approve"
            },
            {
              "type": "button",
              "text": {
                "type": "plain_text",
                "text": "AT отчет",
                "emoji": true
              },
              "style": "danger",
              "value": "decline"
            },
            {
              "type": "button",
              "text": {
                "type": "plain_text",
                "text": "Ручные прогоны",
                "emoji": true
              },
              "value": "details"
            }
          ]
        },
        {
          "type": "divider"
        },
        {
          "type": "context",
          "elements": [
            {
              "type": "image",
              "image_url": "https://a.slack-edge.com/production-standard-emoji-assets/13.0/apple-large/26d4@2x.png",
              "alt_text": "Blocker"
            },
            {
              "type": "mrkdwn",
              "text": "*Blocker*"
            }
          ]
        },
        {
          "type": "divider"
        },
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "*<https://jira.sberbank.ru/browse/VC-5274|" +blockerLink+ ">*"
          },
          "accessory": {
            "type": "overflow",
            "options": [
              {
                "text": {
                  "type": "plain_text",
                  "text": ":white_check_mark: Mark as done",
                  "emoji": true
                },
                "value": "done"
              },
              {
                "text": {
                  "type": "plain_text",
                  "text": ":pencil: Edit",
                  "emoji": true
                },
                "value": "edit"
              },
              {
                "text": {
                  "type": "plain_text",
                  "text": ":x: Delete",
                  "emoji": true
                },
                "value": "delete"
              }
            ]
          }
        },
        {
          "type": "divider"
        },
        {
          "type": "context",
          "elements": [
            {
              "type": "image",
              "image_url": "https://api.slack.com/img/blocks/bkb_template_images/highpriority.png",
              "alt_text": "palm tree"
            },
            {
              "type": "mrkdwn",
              "text": "*Critical*"
            }
          ]
        },
        {
          "type": "divider"
        },
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "*<https://jira.sberbank.ru/browse/VC-5227|VC-5227 - Не удаляется виджет на устройствах>*"
          },
          "accessory": {
            "type": "overflow",
            "options": [
              {
                "text": {
                  "type": "plain_text",
                  "text": ":white_check_mark: Mark as done",
                  "emoji": true
                },
                "value": "done"
              },
              {
                "text": {
                  "type": "plain_text",
                  "text": ":pencil: Edit",
                  "emoji": true
                },
                "value": "edit"
              },
              {
                "text": {
                  "type": "plain_text",
                  "text": ":x: Delete",
                  "emoji": true
                },
                "value": "delete"
              }
            ]
          }
        },
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "*<https://jira.sberbank.ru/browse/VC-5251|VC-5251 - Нельзя подвинуть сторис карточки между собой>*"
          },
          "accessory": {
            "type": "overflow",
            "options": [
              {
                "text": {
                  "type": "plain_text",
                  "text": ":white_check_mark: Mark as done",
                  "emoji": true
                },
                "value": "done"
              },
              {
                "text": {
                  "type": "plain_text",
                  "text": ":pencil: Edit",
                  "emoji": true
                },
                "value": "edit"
              },
              {
                "text": {
                  "type": "plain_text",
                  "text": ":x: Delete",
                  "emoji": true
                },
                "value": "delete"
              }
            ]
          }
        },
        {
          "type": "divider"
        },
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "*Остальные найденные минор и ниже по приоритету дефекты*\n<https://jira.sberbank.ru/browse/VC-5210?jql=project%20%3D%20VC%20AND%20issuetype%20%3[…]Отклонен%20исполнителем%22)%20AND%20component%20%3D%20widget|👉Список багов в Jira>"
          }
        },
        {
          "type": "divider"
        },
        {
          "type": "context",
          "elements": [
            {
              "type": "mrkdwn",
              "text": "Список участников"
            },
            {
              "type": "mrkdwn",
              "text": "<fakelink.toUser.com|Павел Виноградов>, <fakelink.toUser.com|Туманов Александр>"
            }
          ]
        }
      ],
      text: `Шалость удалась there >!` + msg
    });
  }
  catch (error){
    console.error(error);
  }

});
