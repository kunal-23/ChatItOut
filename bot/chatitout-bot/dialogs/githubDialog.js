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
  
   
  
  class GITHUBDialog extends ComponentDialog {
  
    constructor(conversationState,userState) {
  
      super("get status");
  
   
      console.log("insiderun10")
      this.addDialog(new ChoicePrompt(CHOICE_DIALOG))
      this.addDialog(new TextPrompt(TEXT_DIALOG))
      this.addDialog(new WaterfallDialog(MAIN_WATERFALL_DIALOG,[
          this.getStatus.bind(this),
          this.getReponame.bind(this),
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
  
      return await stepContext.prompt(CHOICE_DIALOG,'choose one of the following',['PR Status','RAISE PR'])
  
    }
    
    async getReponame(stepContext) {
        console.log("stepppppp--->",stepContext)
     if(stepContext.result === 'PR Status' ){
       return await stepContext.prompt(TEXT_DIALOG,'Enter Repository name')
       
     }
     return await stepContext.prompt(TEXT_DIALOG,'Enter Repository name')
    }
  
   
  
    /**
  
     * This is the final step in the main waterfall dialog.
  
     */
  
    async finalStep(stepContext) {
      console.log("insiderun90")
  
      if (stepContext.result ) {
          console.log("resullttt-->",stepContext.result)
              const result = stepContext.result
  
              const options = {
                  method: 'GET',
                  headers: { 'Content-Type': 'application/json',
                              'Authorization': 'Bearer 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'
              
              }
                }
              
                const url = `https://api.github.com/repos/babitaTest/${stepContext.result}/pulls`;
                var msg = 'Story --------------  Status'
                
                try {
                  const response = await fetch(url , options)
                  console.log('response--->',response)
                  const jsonResponse = await response.json();
                  console.log('JSON response', jsonResponse);
                  for(let i=0; i<jsonResponse.length; i++){
                    msg =msg + `\n\n ${jsonResponse[i].number} ----------------------- ${jsonResponse[i].state}`                  
                  }
                  
                  
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
  
  module.exports.GITHUBDialog = GITHUBDialog;
  