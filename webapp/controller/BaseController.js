/*global history */
/*eslint-disable no-console, no-alert */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/core/UIComponent",
	"sap/m/MessageBox"
], function (Controller, History, UIComponent, MessageBox) {
	"use strict";

	return Controller.extend("br.com.Tempo.controller.BaseController", {

		init: function () {

		},

		getModel: function (sName) {
			return this.getView().getModel(sName);
		},

		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		getModelGlobal: function (sName) {
			return this.getOwnerComponent().getModel(sName);
		},

		setModelGlobal: function (oModel, sName) {
			return this.getOwnerComponent().setModel(oModel, sName);
		},

		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},

		onConverterTemperatura: function (value) {

			if (value != undefined) {
				return Math.round((value - 273.15) * 100) / 100;
			}
		},

		onNavBack: function (oEvent) {

			var oHistory, sPreviousHash;
			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getRouter().navTo("NotFound", {}, true);
			}
		},

		onMensagemErroODATA: function (error) {

			if (error.responseText == undefined) {

				var error2 = error.response.body;

				if (error2 == undefined) {

					var errorLog = error.message;

				} else {

					var parser = new DOMParser();
					var xmlDoc = parser.parseFromString(error2, "text/xml");

					try {
						var msg = xmlDoc.getElementsByTagName("message")[0].childNodes[0].nodeValue;

					} catch (y) {
						var msg = xmlDoc.getElementsByTagName("body")[0].childNodes[0].textContent;
					}

					errorLog = msg;
				}

			} else {

				try {

					errorLog = JSON.parse(error.responseText)["error"].message.value;

				} catch (x) {

					var parser = new DOMParser();
					var xmlDoc = parser.parseFromString(error.responseText, "text/xml");

					try {
						var msg = xmlDoc.getElementsByTagName("message")[0].childNodes[0].nodeValue;

					} catch (y) {
						var msg = xmlDoc.getElementsByTagName("body")[0].childNodes[0].textContent;
					}

					// var code = xmlDoc.getElementsByTagName("code")[0].childNodes[0].nodeValue;

					errorLog = msg;

				}
			}

			MessageBox.show(
				errorLog, {
					icon: MessageBox.Icon.WARNING,
					title: "Erro!",
					actions: [MessageBox.Action.OK],
					onClose: function (oAction) {

					}
				}
			);
		},

		setLog: function (sLog, sClasse) {
			console.log("[" + sClasse + "]", sLog);
		}

	});
});