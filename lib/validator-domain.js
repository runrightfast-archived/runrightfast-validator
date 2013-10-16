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

	var Entity = require('runrightfast-commons').Entity;
	var util = require('util');
	var Joi = require('joi');

	var validate = function validate(obj, schema) {
		var error = Joi.validate(obj, schema);
		if (error) {
			throw error;
		}
	};

	var ObjectSchema = function ObjectSchema(options) {
		Entity.call(this, options);
		var schema = {
			namespace : Joi.types.String().regex(/ns:\/\/.+/).required(),
			version : Joi.types.String().regex(/\d+.\d+.\d+/).required(),
			description : Joi.types.String().required()
		};
		validate(options, schema);

		this.namespace = options.namespace;
		this.version = options.version;
		this.description = options.description;
		this.types = options.types || {};
	};

	util.inherits(ObjectSchema, Entity);

	var Type = function Type(options) {
		var schema = {
			name : Joi.types.String().min(1).required(),
			description : Joi.types.String().required(),
			strict : Joi.types.Boolean()
		};
		validate(options, schema);

		this.name = options.name;
		this.description = options.description;
		if (!lodash.isUndefined(options.strict)) {
			this.strict = options.strict;
		}
		this.properties = options.properties || {};
	};

	module.exports = {
		ObjectSchema : ObjectSchema,
		Type : Type
	};

}());
