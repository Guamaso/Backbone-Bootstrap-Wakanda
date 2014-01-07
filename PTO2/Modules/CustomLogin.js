﻿//Creating the User class object to export.var User = new DataClass("Users");//Add User attributes.User.id = new Attribute("storage", "uuid", "key auto");User.email = new Attribute("storage", "string", "btree");User.password = new Attribute("calculated", "string");User.HA1Key = new Attribute("storage", "string");User.role = new Attribute("storage", "string", "btree");User.fullName = new Attribute("storage", "string", "btree");User.floatingDaysSrv = new Attribute("storage", "long", {scope: "publicOnServer"});User.floatingDays = new Attribute("calculated", "long");User.ptoHoursSrv = new Attribute("storage", "long", {scope: "publicOnServer"});User.ptoHours = new Attribute("calculated", "long");User.compHoursSrv = new Attribute("storage", "long", {scope: "publicOnServer"});User.compHours = new Attribute("calculated", "long");User.ptoAccrualRateSrv = new Attribute("storage", "number", {scope: "publicOnServer"});User.ptoAccrualRate = new Attribute("calculated", "number");User.ptoSeedDate = new Attribute("storage", "date");User.myManagerId = new Attribute("storage", "uuid");//My ManagerUser.myManager = new Attribute("relatedEntity", "User", "User"); // relation to the User classUser.myEmployees = new Attribute("relatedEntities", "User", "myManager", {reversePath:true});User.requestCollection = new Attribute("relatedEntities", "Requests", "owner", {reversePath:true});//Class methods.User.methods = {};User.methods.currentUserBelongsTo = function(paramObj) {	return(currentSession().belongsTo(paramObj.groupName));};User.methods.login = function(loginData) {	return(loginByPassword(loginData.email, loginData.password));};User.methods.addUser = function(signUpData) {	// Add a new user account.	var passwordRegexStr, isValid,		sessionRef = currentSession(), // Get session.		promoteToken = sessionRef.promoteWith("Admin"), //temporarily make this session Admin level.		newUser;		if (loginByPassword(signUpData.email, signUpData.password)) {		return {error: 8020, errorMessage: "You are already signed up."};		} else {		//Check if the password is at least 7 characters and one digit.		if (signUpData.password !== null) {			passwordRegexStr = /^(?=.*\d)[a-zA-Z\d]{7,}$/;			isValid = passwordRegexStr.test(signUpData.password);			if (!isValid) {				return {error: 8025, errorMessage: "Password must be at least 7 characters."};			}		}				//Check if password is enterd the same both times on the Sign Up form.		if (signUpData.password !== signUpData.verifyPassword) {			return {error: 8030, errorMessage: "Verification of password failed."};		}				newUser =  ds.User.createEntity();       	newUser.fullName = signUpData.name;         	newUser.email = signUpData.email;           	newUser.password = signUpData.password;       	       	//*** Best Pratice ***       	//Save the new User in a Try Catch block and put your validation code for the email address in the User        	// onValidate() method (see model.User.events.onValidate below). This is better than doing validation checks in this        	// function because you may create other methods in the future that save a new User.       	       	try {			newUser.save(); //Save the entity.			sessionRef.unPromote(promoteToken); //Put the session back to normal.       		if (loginByPassword(signUpData.email, signUpData.password)) {       			return {error: 8010, errorMessage: "Congratulations on your new account!"};       		} else {       			return {error: 8090, errorMessage: "I'm sorry but we could not sign you up."};			}		}		catch(e) {			return {error: 8099, errorMessage: e.messages[1]};		}				sessionRef.unPromote(promoteToken); //Put the session back to normal.	} // end if (loginByPassword(signUpData.login, signUpData.password))};//Class methods scope.User.methods.addUser.scope ="public";User.methods.login.scope ="public";User.methods.currentUserBelongsTo.scope ="public";//Calculated Attributes.User.ptoAccrualRate.onGet = function() {	var sessionRef = currentSession();	if (sessionRef.belongsTo("Administrator") || sessionRef.belongsTo("Manager")) {		return this.ptoAccrualRateSrv;	} else {		return null;	}};User.ptoAccrualRate.onSet = function(value) {	var sessionRef = currentSession();	if (sessionRef.belongsTo("Administrator") || sessionRef.belongsTo("Manager")) {		this.ptoAccrualRateSrv = value;	}};User.compHours.onGet = function() {	var sessionRef = currentSession();	if (sessionRef.belongsTo("Administrator") || sessionRef.belongsTo("Manager")) {		return this.compHoursSrv;	} else {		return null;	}};User.compHours.onSet = function(value) {	var sessionRef = currentSession();	if (sessionRef.belongsTo("Administrator") || sessionRef.belongsTo("Manager")) {		this.compHoursSrv = value;	}};User.ptoHours.onGet = function() {	var sessionRef = currentSession();	if (sessionRef.belongsTo("Administrator") || sessionRef.belongsTo("Manager")) {		return this.ptoHoursSrv;	} else {		return null;	}};User.ptoHours.onSet = function(value) {	var sessionRef = currentSession();	if (sessionRef.belongsTo("Administrator") || sessionRef.belongsTo("Manager")) {		this.ptoHoursSrv = value;	}};User.floatingDays.onGet = function() {	var sessionRef = currentSession();	if (sessionRef.belongsTo("Administrator") || sessionRef.belongsTo("Manager")) {		return this.floatingDaysSrv;	} else {		return null;	}};User.floatingDays.onSet = function(value) {	var sessionRef = currentSession();	if (sessionRef.belongsTo("Administrator") || sessionRef.belongsTo("Manager")) {		this.floatingDaysSrv = value;	}};User.password.onGet = function() {	return "*****"; //could also return Null.};User.password.onSet = function(value) {	this.HA1Key = directory.computeHA1(this.id, value);};//Entity methods.User.entityMethods = {};User.entityMethods.validatePassword = function(password){	var ha1 = directory.computeHA1(this.id, password);	return (ha1 === this.HA1Key); //true if validated, false otherwise.};//EventsUser.events = {};/*User.events.onRestrictingQuery = function() {	var myCurrentUser = currentUser(), // we get the user of the current session.		sessionRef = currentSession(), // Get session.		result;		result = ds.User.createEntityCollection(); //default to empty collection.		if (sessionRef.belongsTo("Administrator") || sessionRef.belongsTo("Manager")) {		result = ds.User.all();	} else {		result = ds.User.query("id = :1", myCurrentUser.ID);	}		//result = ds.User.all();	return result;} //end - onRestrictingQuery();*/User.events.onValidate = function() {	var err, emailRegexStr, isValid;	//Check the email to see if it's valid.	if (this.email !== null) {		emailRegexStr = /^[a-zA-Z0-9.-_]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;		isValid = emailRegexStr.test(this.email);		if (!isValid) {			err = {error: 8080, errorMessage: "Email is invalid."};		}	}		return err;};User.events.onSave = function() {	theClass = this.getDataClass(), //get the dataclass of the entity to save   	theClassName = theClass.getName(), //get the dataclass name    oldEntity = theClass(this.getKey()); //find the same entity on disk    	//create a link to the manager.	//Refactor this code. Dec 6, 2013	if (this.myManagerId) {		if (this.isNew()) {			var theManager = ds.User.find("id = :1", this.myManagerId);			if (theManager) {			 	this.myManager = theManager;			 }		} else {			if (this.myManagerId !== oldEntity.myManagerId) {			 	var theManager = ds.User.find("id = :1", this.myManagerId);			 	if (theManager) {			 		this.myManager = theManager;			 	} else {			 		//Don't know what I'm going to do here yet.			 	} //end - if (theManager).			 }		} //end - if (this.isNew()).	} //end - if (this.myManagerId).};module.exports.User = User;//Wakanda Login Listenervar customLoginListener = function (emailAddress, password) {	var sessionRef = currentSession(); // Get session.	//May need permission to read User class for new session.	sessionRef.promoteWith('Administrator');		var myUser = ds.User({email:emailAddress});	if (myUser === null) {		return false;	} else {		//we will handle login		if (myUser.validatePassword(password)) {			var theGroups = [];						switch (myUser.role) {				case "Administrator":				theGroups = ['Administrator'];				break;				case "Manager":				theGroups = ['Manager'];				break;				default:				theGroups = ['Employee'];				break;			}						var connectTime = new Date();			return {				ID: myUser.id,				name: myUser.email, //myUser.login,				fullName: myUser.fullName, 				belongsTo: theGroups,				storage: {time: connectTime}			}					} else {					return {error: 1024, errorMessage: "invalid login"};		}			}		currentSession().unPromote();};module.exports.customLoginListener = customLoginListener;