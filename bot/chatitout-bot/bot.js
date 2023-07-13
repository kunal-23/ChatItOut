// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler, MessageFactory } = require('botbuilder');
const {JIRADialog} = require('./dialogs/jiraDialog')
const {GITHUBDialog} = require('./dialogs/githubDialog')
const {ServiceNowDialog} = require('./dialogs/serviceNowDialog')

class EchoBot extends ActivityHandler 
{
  
    constructor(conversationState,userState) {

        super();
        this.conversationState = conversationState
        this.userState = userState
        this.dialogState = conversationState.createProperty('dialogstate')
        this.jiraStatusDialog = new JIRADialog(this.conversationState,this.userState)
        this.githubStatusDialog = new GITHUBDialog(this.conversationState,this.userState)
        this.serviceNowStatusDialog = new ServiceNowDialog(this.conversationState,this.userState)

        this.previousIntent = this.conversationState.createProperty("previousIntent")
        this.conversationData = this.conversationState.createProperty("conversationData")
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            console.log("in message dialoggg--->",this.conversationData.endDialog)
            await this.dispatchKunal(context);
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
        this.onDialog(async(context,next)=>{
          console.log("context--->",context)
          await this.conversationState.saveChanges(context,false);
          await this.userState.saveChanges(context,false);
          await next()
        })
        this.onMembersAdded(async (context, next) => {
            // const membersAdded = context.activity.membersAdded;
            // const welcomeText = 'Hello and welcome!';
            // for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
            //     if (membersAdded[cnt].id !== context.activity.recipient.id) {
            //         await context.sendActivity(MessageFactory.text(welcomeText, welcomeText));
            //     }
            // }
            // // By calling next() you ensure that the next BotHandler is run.
            // await next();

            const membersAdded = context.activity.membersAdded
      for (const member of membersAdded) {
        if (member.id !== context.activity.recipient.id) {
          // If we are in Microsoft Teams
          if (context.activity.channelId === "msteams") {
            // Send a message with an @Mention
            await this._messageWithMention(context, member)
          } else {
            // Otherwise we send a normal echo
            await context.sendActivity(
              `Welcome to Simon Bot ${member.name}. This Bot is a work in progres. At this time we have some dialogs working. Type anything to get started.`
            )
            await this.sendSuggestedActions(context)
          }
        }
      }
      // By calling next() you ensure that the next BotHandler is run.
      await next()
        });
    }

    async sendSuggestedActions(context){
      var reply = MessageFactory.suggestedActions(['JIRA','GITHUB','ServiceNow'],'Hi, choose one of them')
      await context.sendActivity(reply);
    }

    async _messageWithMention(context, member) {
      // Create mention object
      const mention = {
        mentioned: member,
        text: `<at>${member.name}</at>`,
        type: "mention"
      }
  
      // Construct message to send
      const message = {
        entities: [mention],
        text: `Welcome to Simon Bot ${mention.text}. This Bot is a work in progress. At this time we have some dialogs working. Type anything to get started.`,
        type: ActivityTypes.Message
      }
  
      await context.sendActivity(message)
    }


    async dispatchKunal(context){
      var currentIntent = ''
      console.log('intent1--->',currentIntent)
      const previousIntent = await this.previousIntent.get(context,{})
      const conversationData = await this.conversationData.get(context,{})

      console.log("previousintent",previousIntent)
      console.log("conversationData",conversationData)

      if(previousIntent.intentName && conversationData.endDialog === false){
        console.log('intent2--->',currentIntent)
        currentIntent = previousIntent.intentName;
        console.log('intent3--->',currentIntent)

      }
      else if(previousIntent.intentName && conversationData.endDialog === true){
        console.log('intent4--->',currentIntent)
        currentIntent = context.activity.text;
        console.log('intent5--->',currentIntent)

      }
      else{
        console.log('intent6--->',currentIntent)
        currentIntent = context.activity.text;
        console.log('intent7--->',currentIntent)
        await this.previousIntent.set(context,{intentName: context.activity.text});
       

      }
     
      switch(currentIntent){
        
        case 'JIRA':
          console.log('intent8--->',currentIntent)
          await this.conversationData.set(context,{endDialog: false})
          await this.jiraStatusDialog.run(context,this.dialogState)
          conversationData.endDialog = await this.jiraStatusDialog.isDialogComplete()
          console.log("dialoggg-->",conversationData.endDialog)
          
          if(conversationData.endDialog){
            await this.conversationData.set(context,{endDialog: true})
            await this.sendSuggestedActions(context)

          }
          break;
          case 'GITHUB':
            console.log('intent8--->',currentIntent)
            await this.conversationData.set(context,{endDialog: false})
            await this.githubStatusDialog.run(context,this.dialogState)
            conversationData.endDialog = await this.githubStatusDialo.isDialogComplete()
            
            if(conversationData.endDialog){
              await this.conversationData.set(context,{endDialog: true})
              await this.sendSuggestedActions(context)
  
            }
            break;

            case 'ServiceNow':
              console.log('intent8--->',currentIntent)
              await this.conversationData.set(context,{endDialog: false})
              await this.serviceNowStatusDialog.run(context,this.dialogState)
              conversationData.endDialog = await this.serviceNowStatusDialog.isDialogComplete()
              if(conversationData.endDialog){
                await this.conversationData.set(context,{endDialog: true})
                await this.sendSuggestedActions(context)
    
              }
              break;

      }
      
    }

   
}

module.exports.EchoBot = EchoBot;
