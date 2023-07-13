const {
    ComponentDialog,
    DialogSet,
    DialogTurnStatus,
    WaterfallDialog,
    ChoicePrompt,
    TextPrompt
  } = require('botbuilder-dialogs') 
  
  const fetch = require("node-fetch");
  
  
  // v4 
  
   
  
  const CHOICE_DIALOG = "choiceDialog"
  const TEXT_DIALOG = "textDialog"
  var endDialog = '';
  var jiraUserName = ''
  
  const MAIN_WATERFALL_DIALOG = "waterfallDialog"
  
   
  
  class ServiceNowDialog extends ComponentDialog {
  
    constructor(conversationState,userState) {
  
      super("get status");
  
   
      console.log("insiderun10")
      this.addDialog(new ChoicePrompt(CHOICE_DIALOG))
      this.addDialog(new TextPrompt(TEXT_DIALOG))
      this.addDialog(new WaterfallDialog(MAIN_WATERFALL_DIALOG,[
          this.getStatus.bind(this),
          this.getDescription.bind(this),
          this.finalStep.bind(this)
      ]))
      console.log("insiderun11")
  
  
   
  
      this.initialDialogId = MAIN_WATERFALL_DIALOG
      console.log("insiderun12")
  
    }
  
   
  
    /**
  
     * The run method handles the incoming activity (in the form of a DialogContext) and passes it through the dialog system.
  
     * If no dialog is active, it will start the default dialog.
  
     * @param {TurnContext} context
  
     */
  
    async run(context, accessor) {
      
      console.log("insiderun1")
  
      const dialogSet = new DialogSet(accessor)
      console.log("insiderun2")
  
      dialogSet.add(this)
      console.log("insiderun3")
  
   
  
      const dialogContext = await dialogSet.createContext(context)
      console.log("insiderun4")
  
      const results = await dialogContext.continueDialog()
      console.log("insiderun5")
      console.log('results----->',results)
      if (results.status === DialogTurnStatus.empty) {
        console.log("insiderun6")
          console.log('id--->',this.id)
  
        await dialogContext.beginDialog(this.id)
        console.log("insiderun7")
  
      }
  
    }
  
   
  
    /**
  
     * Initial step in the waterfall. This will kick of the site dialog
  
     */
  
    async getStatus(stepContext) {
      console.log("insiderun9",stepContext)
      endDialog = false;
  
      return await stepContext.prompt(CHOICE_DIALOG,'choose one of the following',['Ticket Status','Create Ticket','Delete Ticket'])
  
    }
    
    async getDescription(stepContext) {
        console.log("stepppppp--->",stepContext)
    //  if(stepContext.result === 'PR Status' ){
    //    return await stepContext.prompt(TEXT_DIALOG,'Enter Repository name')
       
    //  }
     return await stepContext.prompt(TEXT_DIALOG,'Enter Description for your ticket')
    }
    
   
    
  
    /**
  
     * This is the final step in the main waterfall dialog.
  
     */
  
    async finalStep(stepContext) {
      console.log("insiderun90")
  
      if (stepContext.result ) {
          console.log("resullttt-->",stepContext.result)
              
  
              const options = {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json',
                              'Authorization': 'Basic YWRtaW46d3RXVDB0KklrL0o0'
                       },
                  body:    JSON.stringify({
                    description: stepContext.result
                  })
                }
              
                const url = `https://dev124380.service-now.com/api/now/v1/table/incident`;
                var msg = ""
                
                try {
                  const response = await fetch(url , options)
                  console.log('response--->',response)
                  const jsonResponse = await response.json();
                  console.log('JSON response', jsonResponse);
                //   for(let i=0; i<jsonResponse.length; i++){
                //     msg =msg + `\n\n ${jsonResponse[i].number} ----------------------- ${jsonResponse[i].state}`                  
                //   }
                msg = msg + `Your ticket has been created with ticketId ${jsonResponse.result.number}`
                  
                  
                  msg =msg
                } catch(err) {
                  console.log('ERROR', err);
                }
  
          
              await stepContext.context.sendActivity(msg)
  
          
  
        
  
      }
      endDialog = true; 
      return await stepContext.endDialog()
  
    }
  
    async isDialogComplete(){
      return endDialog;
    }
  
  }
  
  module.exports.ServiceNowDialog = ServiceNowDialog;
  