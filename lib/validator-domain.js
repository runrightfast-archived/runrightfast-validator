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

(function() {
	'use strict';

	var lodash = require('lodash');
	var assert = require('assert');
	var Joi = require('joi');

	var ObjectSchema = function ObjectSchema(options) {
		assert(lodash.isObject(options), 'options is required');
		var schema = {
			namespace : Joi.types.String().regex(/ns:\/\/.+/).required(),
			version : Joi.types.String().regex(/\d+.\d+.\d+/).required(),
			description : Joi.types.String()
		};
		var error = Joi.validate(options, schema);
		if (error) {
			throw error;
		}

		this.namespace = options.namespace;
		this.version = options.version;
		this.description = options.description;
	};

	module.exports = {
		ObjectSchema : ObjectSchema
	};

}());
