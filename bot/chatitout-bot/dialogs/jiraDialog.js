const {
  ComponentDialog,
  DialogSet,
  DialogTurnStatus,
  WaterfallDialog,
  ChoicePrompt
} = require('botbuilder-dialogs') 

const fetch = require("node-fetch");
//let table = require("table");
let Table = require('cli-table');
let table = new Table();

let data, config;
 

// v4 

 

const CHOICE_DIALOG = "choiceDialog"
var endDialog = '';

const MAIN_WATERFALL_DIALOG = "waterfallDialog"

 

class JIRADialog extends ComponentDialog {

  constructor(conversationState,userState) {

    super("get status");

 

    this.addDialog(new ChoicePrompt(CHOICE_DIALOG))
    this.addDialog(new WaterfallDialog(MAIN_WATERFALL_DIALOG,[
        this.getStatus.bind(this),
        this.finalStep.bind(this)
    ]))


 

    this.initialDialogId = MAIN_WATERFALL_DIALOG

  }

 

  /**

   * The run method handles the incoming activity (in the form of a DialogContext) and passes it through the dialog system.

   * If no dialog is active, it will start the default dialog.

   * @param {TurnContext} context

   */

  async run(context, accessor) {

    const dialogSet = new DialogSet(accessor)

    dialogSet.add(this)

 

    const dialogContext = await dialogSet.createContext(context)

    const results = await dialogContext.continueDialog()

    if (results.status === DialogTurnStatus.empty) {
        console.log('id--->',this.id)

      await dialogContext.beginDialog(this.id)

    }

  }

 

  /**

   * Initial step in the waterfall. This will kick of the site dialog

   */

  async getStatus(stepContext) {
    endDialog = false;

    return await stepContext.prompt(CHOICE_DIALOG,'choose one of the following',['Status','Create','Update'])

  }

 

  /**

   * This is the final step in the main waterfall dialog.

   */

  async finalStep(stepContext) {

    if (stepContext.result ) {
        console.log("resullttt-->",stepContext.result)
        if(stepContext.result.value === 'Status'){
            const result = stepContext.result

            const options = {
                method: 'GET',
                headers: { 'Content-Type': 'application/json',
                            'Authorization': 'Basic a2FubnVnYXJnMjM3ODZAZ21haWwuY29tOkFUQVRUM3hGZkdGMDFBRU5zRkxVZEw0YVRITUR0dURLbWN6dnVoZFVYejFaMHZ0OWt2ODBtT2sxYmVKbVl2T2I2UzFfQTdkS2J6ZFU4THlIaEJBamVQb284T002dDhpdld5RFBERkV3c3VnWVRMZFlvd2RjTmxjUVBOZDVEX0JVNTU3dFIwNkhoSjdwRXRrLVhRZ2NVQmpSbW5ReXZ4SC1aMFo5dFNSUW5vcVl1d05HYVBUdzYzTT05RUM3N0JCQQ=='
            
            }
              }
            
              const url = 'https://kannugarg23786.atlassian.net/rest/api/2/search?';
              var msg = "Story ------------------------- Status"
              console.log("msgggggg",msg)
              data = [["Story","Status"]]
              table.push(['Story', 'Status']);
              try {
                const response = await fetch(url + new URLSearchParams({
                  jql: `assignee[displayName]="kunal"`
              }), options)
                console.log('response--->',response)
                const jsonResponse = await response.json();
                console.log('JSON response', jsonResponse);
                console.log('JSON response-->', jsonResponse.issues.length);
                for(let i=0; i<jsonResponse.issues.length; i++){
                  msg =msg + `\n\n ${jsonResponse.issues[i].fields.summary} ----------------------- ${jsonResponse.issues[i].fields.status.name}`               
                }
                // console.log("data--->",table)
                // console.log("data--->",table.toString())
                // config = { 
                //   columns: {
                //     0: {
                //       width: 14 // Column 0 of width 1
                //     },
                //     1: {
                //       width: 14  // Column 1 of width 20
                //     }
                //   },
                  
                // };
                // //let x = table.table(data, config);
                // //console.log(x)
                // //msg =table
                // const stringifyTable = (table) => {
                //   const lines = table.split('\n');
                //   const dataLines = lines.slice(2, -1);
                //   return dataLines.join('\n');
                // };
                
                // // Convert the table to a string and remove width values
                // const tableString = stringifyTable(table.toString());

                // // Send the table as an activity in the Bot Framework
                // const replyActivity = { type: 'message', text: tableString };
               // await stepContext.context.sendActivity(replyActivity);
              } catch(err) {
                console.log('ERROR', err);
              }

        
            await stepContext.context.sendActivity(msg)

        }

      

    }
    endDialog = true; 
    return await stepContext.endDialog()

  }

  async isDialogComplete(){
    return endDialog;
  }

}

module.exports.JIRADialog = JIRADialog;
