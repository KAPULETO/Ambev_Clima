/*eslint-disable sap-no-hardcoded-url, no-alert */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"br/com/Tempo/controller/BaseController",
	"sap/viz/ui5/format/ChartFormatter",
	"sap/ui/model/json/JSONModel",
	"sap/viz/ui5/controls/common/feeds/FeedItem",
	"sap/viz/ui5/data/FlattenedDataset"
], function (Controller, BaseController, ChartFormatter, JSONModel, FeedItem, FlattenedDataset) {

	"use strict";

	return BaseController.extend("br.com.Tempo.controller.Tempo", {

		onInit: function () {

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("TargetTempo").attachPatternMatched(this._onObjectMatched, this);
			// oRouter.attachRoutePatternMatched (this._onObjectMatched, this);
		},

		_onObjectMatched: function () {

			// var that = this;

			this.onInicializaModels();
			this.onConfigurarGrafico();

		},

		onAfterRendering: function () {

			// var auxEstados = [];

			// function removerDuplicados(array) {

			// 	function filtro(value, index, self) {
			// 		if (index + 1 < self.length) {

			// 			if (value.country.indexOf(self[index + 1].country) == -1) {
			// 				return value;
			// 			}
			// 		}
			// 	}

			// 	return array.filter(filtro);
			// }

			// var vetorTodosEstados = this.getModel("modelEstados").getData();

			// vetorTodosEstados.sort(function (a, b) {
			// 	if (a.country < b.country) {
			// 		return -1;
			// 	}
			// 	if (a.country > b.country) {
			// 		return 1;
			// 	}
			// 	return 0;
			// });

			// var oModelEstados = new JSONModel(removerDuplicados(vetorTodosEstados));
			// this.setModel(oModelEstados, "Estados");

			// this.getModel("modelBusy").setProperty("/SfPaises", false);

		},

		onInicializaModels: function () {

			var aux = {
				SfPaises: false,
				SfCidades: false,
				dialog: false
			};

			var oModel = new JSONModel(aux);
			this.setModel(oModel, "modelBusy");

			var auxSettings = {
				grafico1: true,
				grafico2: true,
				grafico3: true,
				grafico4: true
			};

			var oModelSettings = new JSONModel(auxSettings);
			this.setModel(oModelSettings, "settings");

			// var auxSettings = {
			// 	grafico1: true,
			// 	grafico2: true,
			// 	grafico3: true,
			// 	grafico4: true,
			// };
			var vetorItensGraf2 = {
				dados: []
			};

			var oModelGraf2 = new JSONModel(vetorItensGraf2);
			this.setModel(oModelGraf2);

			var vetor = [];
			var oModelGraf1 = new JSONModel(vetor);
			this.setModel(oModelGraf1, "modelGraf1");

			var oModelClima = new JSONModel({
				main: "",
				description: ""
			});
			this.setModel(oModelClima, "modelClima");

			var aux2 = {
				Cidade: "",
				UrlModel: "https://cors-anywhere.herokuapp.com/https://api.openweathermap.org/data/2.5",
				ChaveAcesso: "59804afdba2d6d744fa03372aad0d23d"
			};

			var oModelTela = new JSONModel(aux2);
			this.setModelGlobal(oModelTela, "modelTela");

		},

		onSuggestPaises: function (evt) {

			var sValue = evt.getSource().getValue();
			var aFilters = [];
			var oFilter = [
				new sap.ui.model.Filter("country", sap.ui.model.FilterOperator.Contains, sValue)
			];

			var allFilters = new sap.ui.model.Filter(oFilter, false);

			aFilters.push(allFilters);

			this.byId("idPaises").getBinding("suggestionItems").filter(aFilters);
			this.byId("idPaises").suggest();
		},

		onFilterCidades: function (evt) {

			var sValue = evt.getSource().getValue();
			var aFilters = [];
			var oFilter = [
				// new sap.ui.model.Filter("idade", sap.ui.model.FilterOperator.Contains, sValue), 
				new sap.ui.model.Filter("name", sap.ui.model.FilterOperator.Contains, sValue)
			];

			var allFilters = new sap.ui.model.Filter(oFilter, false);
			aFilters.push(allFilters);
			sap.ui.getCore().byId("idTable").getBinding("items").filter(aFilters);
		},

		onAbrirTelaPesq: function () {

			if (this._ItemDialog) {
				this._ItemDialog.destroy(true);
			}

			if (!this._CreateMaterialFragment) {

				this._ItemDialog = sap.ui.xmlfragment(
					"br.com.Tempo.view.Cidades",
					this
				);
				this.getView().addDependent(this._ItemDialog);
			}

			this._ItemDialog.open();
		},

		onAbrirConfig: function () {

			if (this._ItemDialog) {
				this._ItemDialog.destroy(true);
			}

			if (!this._CreateMaterialFragment) {

				this._ItemDialog = sap.ui.xmlfragment(
					"br.com.Tempo.view.ConfigGraficos",
					this
				);
				this.getView().addDependent(this._ItemDialog);
			}

			this._ItemDialog.open();
		},

		onDialogCancelar: function () {

			if (this._ItemDialog) {
				this._ItemDialog.destroy(true);
			}
		},

		onSeletedCidade: function (evt) {

			var that = this;

			var itemSelected = evt.getSource().getBindingContext("modelEstados").getObject();

			var sUrl = this.getModelGlobal("modelTela").getProperty("/UrlModel");
			var ChaveAcesso = this.getModelGlobal("modelTela").getProperty("/ChaveAcesso");

			// var oModel = new sap.ui.model.odata.ODataModel(sUrl);

			// var oModel = new sap.ui.model.odata.v2.ODataModel(sUrl, {
			// 	headers: {
			// 		"appid": ChaveAcesso
			// 	}
			// });

			var oModel = new sap.ui.model.odata.ODataModel(sUrl, {
				headers: {
					"Access-Control-Allow-Origin": "*"
				}
			});

			oModel.setUseBatch(false);

			oModel.read("/weather" + "?q=" + itemSelected.name + "&appid=" + ChaveAcesso, {
				// urlParameters: {
				// 	"$filter": "q='" + "Serrana" + "'&appid=" + ChaveAcesso
				// },
				success: function (e, result) {

					var resultData = JSON.parse(result.body);

					that.getModel("modelClima").setProperty("/main", resultData.weather[0].main);
					that.getModel("modelClima").setProperty("/description", resultData.weather[0].description);

					that.getModel("modelGraf1").setData(resultData);

					var vetorItensGraf2 = that.getModel().getData();
					vetorItensGraf2.dados.push({
						Cidade: itemSelected.name,
						Populacao: itemSelected.stat.population,
						Cost: 0
					});

					that.getModel().refresh();

					that.onDialogCancelar();

				},
				error: function (error) {
					that.onMensagemErroODATA(error);
				}
			});
		},

		onConfigurarGrafico: function (evt) {

			var oVizFrame = this.getView().byId("idVizFrameBar");
			var oFixFlex = this.getView().byId("idFixFlex");

			var dataPath = "";
			oVizFrame.setVizType("stacked_column");

			// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ README!!! ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// or this works also
			//  oVizFrame.setVizType('column');

			// a Simple example here:
			// http://scn.sap.com/community/ui-technology/blog/2013/07/01/sapui5-viz-charts-event-handling 

			// look at the examples here:
			// https://sapui5.netweaver.ondemand.com/test-resources/sap/suite/ui/commons/ChartContainer.html?sap-ui-debug=true&sap-ui-language=de-DE&sap-ui-accessibility=true&sap-ui-jqueryversion=1.11.1&sap-ui-theme=sap_bluecrystal
			// and look in the source code for: oVizFrame4  --> "vizFrame Column Chart Sample"

			oVizFrame.setUiConfig({
				"applicationSet": "fiori"
			});
			var oPopOver = this.getView().byId("idPopOver");
			oPopOver.connect(oVizFrame.getVizUid());

			var oDataset = new FlattenedDataset({
				dimensions: [{
					name: "Cidades",
					value: "{Cidade}"
				}],
				measures: [{
					name: "População",
					value: "{Populacao}"
				}],
				data: {
					path: "/dados"
				}
			});
			
			// , {
			// 		name: "Cost",
			// 		value: "{Cost}"
			// 	}
			
			oVizFrame.setDataset(oDataset);
			oVizFrame.setModel(this.getModel());

			var feedValueAxis = new FeedItem({
					'uid': "valueAxis",
					'type': "Measure",
					'values': ["População"]
				}),
				feedCategoryAxis = new FeedItem({
					'uid': "categoryAxis",
					'type': "Dimension",
					'values': ["Cidades"]
				});

			oVizFrame.addFeed(feedValueAxis);
			oVizFrame.addFeed(feedCategoryAxis);

			oVizFrame.setVizProperties({
				general: {
					layout: {
						padding: 0.04
					}
				},
				valueAxis: {
					// label: {
					// 	formatString: "axisFormat"
					// },
					title: {
						visible: true,
						text: "Total Pop"
					}
				},
				categoryAxis: {
					title: {
						visible: true
					}
				},
				plotArea: {
					dataLabel: {
						visible: true,
						// formatString: "datalabelFormat",
						style: {
							color: null
						}
					}
				},
				legend: {
					title: {
						visible: false
					}
				},
				title: {
					visible: true,
					text: "Gráfico de Habitantes por Cidades"
				}
			});
		}

	});
});