/**
 * Copyright [2013] [runrightfast.co]
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
'use strict';

var expect = require('chai').expect;
var lodash = require('lodash');

var date = require('..').types.DateType;
var joi = require('joi');

describe('DateType', function() {
	it.only('validates that objects are Dates', function() {
		var schema = {
			date : date()
		};

		var error = joi.validate({
			date : new Date()
		}, schema);

		console.log('error : ' + error);

		expect(!!error).to.equal(false);

		error = joi.validate({
			date : 'NOT A DATE'
		}, schema);

		console.log(error);

		expect(!!error).to.equal(true);
	});

});