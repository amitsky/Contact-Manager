
/** This is the Main View **/
var appView = Backbone.View.extend({
	el: 'body',
	initialize : function(){
		this.render();
	},
	render : function(){
		var self = this;
		$.ajax({
			"url" : "js/template/template.html",
			"success" : function(res){
				self.$el.append(res);
				new contactView();
			}
		});

	    return this;
	}
});

/** This is the Contact View **/
var contactView = Backbone.View.extend({
	el:"#container",

	events : {
		"click #create" : "add",//To show the PopUp and initilaize second view
		"click .edit" : "openEditPopUp", //To show the PopUp and initilaize second view
		"click .delete" : "delete"
	},

	initialize : function(){
		this.contactM    = new contact_model();
		this.contactColl = new contact_list();
		this.render();
	},

	render : function(){
		this.$el.html($('#addNew').html());
	    return this;
	},

	add : function(){
		this.contactArDetails = [];
		this.openPopUp();
	},

	openPopUp: function(){
		this.contactAdd = new contact_add({
			el              : "#popUp",
			parentObj       : this,
			contactColl     : this.contactColl,
            contactArDetails: this.contactArDetails
		})
	},

	afterRender : function(model){
        var self = this,
        	listArr = this.contactColl.toJSON(),
        	lastModel = JSON.parse(model);
        console.log("listArr:",this.contactColl.toJSON())
        
        new listItem({
        	model : lastModel,
        	contactColl : this.contactColl,
        	contactArDetails: this.contactArDetails,
        	parentObj : this
        });
        
        
	},
	
	openAddPopUp : function(){
		this.contactArDetails = [];
		this.addNewContact();
	},

	addNewContact : function(){
		// $("#popUp").css("display","block");
		this.contactAdd = new contact_add({
			el              : "#popUp",
			parentObj       : this,
			contactColl     : this.contactColl,
            contactArDetails: this.contactArDetails
		})
	},

	openEditPopUp : function(e){
		var id = $(e.target).parent().parent().parent().attr("data-index");
		 	contactArr = this.contactColl.toJSON(),
            contactDetails = _.filter(contactArr , function (key,index){
                        return (key.id == id);         
            });
        // console.log("contactDetails:",contactDetails);
        this.contactArDetails = contactDetails;
        this.addNewContact();
	},

	delete : function(e){
		var id = $(e.target).parent().parent().parent().attr("data-index");
        if(confirm("Do you want to delete this Contact")){
            var contactArr = this.contactColl.toJSON(),
            contactDetils = _.filter(contactArr,function(key){
                                return (key.id != id);
                             });
            
            
            this.contactColl = new contact_list(contactDetils);
            $(e.target).parent().parent().parent().parent().remove();
        }
	},
	updatethisColl : function(updateModel, updateList){
		this.contactColl = new contact_list(updateList);
		// console.log("chk:",JSON.stringify(this.contactColl))
		this.afterRender(updateModel);
	}
});
/* Second View Start*/
var contact_add = Backbone.View.extend({
	events : {
		"click #submit" : "createList",
		"click #cancel" : "close"
	},
	initialize : function(props){
		this.parentObj   = props.parentObj;
		this.contactColl = props.contactColl;
		this.contactM 	 = new contact_model();
		this.contactArDetails = props.contactArDetails;
        console.log("Add New Contact View is Initialize");
        this.ModelBinder = new Backbone.ModelBinder();
        this.render();
	},
	render : function(){
		$("#popUp").css("display","block");
        var temp = $('#contact-new').html(),
                template = _.template(temp, {});
        $(this.el).html(template);
        this.afterRender();
	 	return this;
	},
	afterRender : function(){
		if(this.contactArDetails.length > 0){
            this.contactM.set(this.contactArDetails[0]);
            this.ModelBinder.bind(this.contactM,this.el);
        }
	},
	cleanup: function() {
        this.undelegateEvents();
        $(this.el).empty();
    },
	createList : function(){
        this.fullname = $('.fullname').val();
        this.email = $('.email').val();
        this.telenum = $('.telenum').val();
		if(this.contactArDetails.length > 0){
			var contactArId = this.contactArDetails[0].id,
				self = this,
				contactColls = this.contactColl.toJSON();
				
				_.map(contactColls, function (key){
                    if(key.id == contactArId){
                      key.fullname = self.fullname,
                      key.email = self.email,
                      key.telenum = self.telenum;  
                    }

                });

                this.contactColl = new contact_list(contactColls);    
			// console.log("chking:",this.contactArDetails[0].id)
		}else{
			
			var self =this;
			this.contactM.set({
				"fullname" : self.fullname,
				"email"    : self.email,
				"telenum"  : self.telenum,
				"id"	   : Math.floor(Math.random()*90000) + 10000
			});
			
			this.contactColl.add(this.contactM);
		}
		console.log("Model Checking.... "+JSON.stringify(this.contactM));
		console.log("collection check:",JSON.stringify(this.contactColl));
		this.parentObj.updatethisColl(JSON.stringify(this.contactM), this.contactColl.toJSON());
		this.close();
		
	},
	close : function(){
		$("#popUp").css("display","none");
		this.cleanup();
	}
})


/** Third View Start **/

var listItem = Backbone.View.extend({
	el: "#contList",
	events : {
		// "click .edit" 	: "edit",
		// "click .delete" : "delete"
	},

	initialize : function( props ){
		// console.log("model:",model)
		this.data = props.model;
		this.contactColl = props.contactColl;
        this.contactArDetails = props.contactArDetails;
        this.parentObj = props.parentObj;
        console.log(this.contactColl.toJSON());
		this.render();
	},

	render : function(){
		var template   = _.template($("#listItem").html());
		var collection = this.contactColl.toJSON();
		this.$el.html(template({ collection : collection }));	
		return this;
	}
});