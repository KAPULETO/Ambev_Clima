/*global QUnit*/

sap.ui.define([
	"br/com/Tempo/controller/Tempo.controller"
], function (Controller) {
	"use strict";

	QUnit.module("Tempo Controller");

	QUnit.test("I should test the Tempo controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});