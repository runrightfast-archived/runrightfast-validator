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
	var joi = require('joi');
	var lodash = require('lodash');
	var Hoek = require('hoek');
	var assert = Hoek.assert;

	var validate = function validate(obj, schema) {
		var error = joi.validate(obj, schema);
		if (error) {
			throw error;
		}
	};

	var validateProperty = function validateType(obj) {
		var schema = {
			name : joi.types.String().regex(/\w+/).required(),
			description : joi.types.String(),
			type : joi.types.String().required(),
			/**
			 * array of objects with following values:
			 * 
			 * <pre>
			 * method 		REQUIRED - constraint method name
			 * args 		REQUIRED - args to be passed to the constraint method
			 * </pre>
			 */
			constraints : joi.types.Array()
		};
		validate(obj, schema);
		assert(lodash.isFunction(joi.types[obj.type]), 'Unsupported type: ' + obj.type);
		if (obj.constraints) {
			var type = joi.types[obj.type]();
			lodash.forEach(obj.constraints, function(c) {
				if (c.method === 'objectSchemaType') {
					var params = {
						namespace : c.args[0],
						version : c.args[1],
						type : c.args[2]
					};
					var objectSchemaTypeParamsSchema = {
						namespace : joi.types.String().regex(/ns:\/\/.+/).required(),
						version : joi.types.String().regex(/\d+.\d+.\d+/).required(),
						type : joi.types.String().required()
					};
					validate(params, objectSchemaTypeParamsSchema);

				} else {
					type = type[c.method].apply(type, c.args);
				}
			});
		}
	};

	var validateType = function validateType(obj) {
		var schema = {
			name : joi.types.String().regex(/\w+/).required(),
			description : joi.types.String(),
			allowOtherKeys : joi.types.Boolean(),
			properties : joi.types.Object()
		};
		validate(obj, schema);
		if (obj.properties) {
			lodash.keys(obj.properties).forEach(function(key) {
				validateProperty(obj.properties[key]);
			});
		}
	};

	var validateObjectSchema = function validateObjectSchema(obj) {
		var schema = {
			namespace : joi.types.String().regex(/ns:\/\/.+/).required(),
			version : joi.types.String().regex(/\d+.\d+.\d+/).required(),
			description : joi.types.String().required(),
			types : joi.types.Object(),
			getObjectSchemaType : joi.types.Function().required()
		};
		validate(obj, schema);
		if (obj.types) {
			lodash.keys(obj.types).forEach(function(key) {
				validateType(obj.types[key]);
			});
		}
	};

	var ObjectSchema = function ObjectSchema(options) {
		Entity.call(this, options);
		validateObjectSchema(options);
		this.namespace = options.namespace;
		this.version = options.version;
		this.description = options.description;
		this.types = options.types || {};
	};

	util.inherits(ObjectSchema, Entity);

	ObjectSchema.prototype.getTypeNames = function() {
		return lodash.keys(this.types);
	};

	ObjectSchema.prototype.getType = function(name) {
		assert(lodash.isString(name), 'name is required and must be a String');
		return this.types[name];
	};

	/**
	 * 
	 * @param type
	 * @throws Error
	 *             if type with the same name already exists
	 */
	ObjectSchema.prototype.addType = function(type) {
		validateType(type);
		if (this.types[type.name]) {
			throw new Error('type already exists: ' + JSON.stringify(this.types[type.name]));
		}
		this.types[type.name] = type;
	};

	/**
	 * removes the specified type from the schema
	 * 
	 * @param name
	 * @returns type that was removed or undefined if type did not exist
	 */
	ObjectSchema.prototype.removeType = function(name) {
		assert(lodash.isString(name), 'name is required and must be a String');
		var preExistingType = this.types[name];
		delete this.types[name];
		return preExistingType;
	};

	/**
	 * If a type with the same name already exists, then it will be replaced.
	 * Otherwise, it adds the new type.
	 * 
	 * @param type
	 * @returns the pre-existing type or undefined
	 */
	ObjectSchema.prototype.setType = function(type) {
		validateType(type);
		var preExistingType = this.types[type.name];
		this.types[type.name] = type;
		return preExistingType;
	};

	var Type = function Type(options) {
		validateType(options);
		this.name = options.name;
		this.description = options.description || this.name;
		this.allowOtherKeys = !!options.allowOtherKeys;
		this.properties = options.properties || {};
	};

	Type.prototype.validate = function(obj) {

	};

	Type.prototype.getSchema = function(obj) {
		var schema = {};
		lodash.forEach(this.properties, function(prop) {
			var propertyType = joi.types[prop.type];
			// schema[prop.name] = ;
		});
		return schema;
	};

	var Property = function Property(options) {
		validateProperty(options);
		this.name = options.name;
		this.description = options.description || this.name;
		this.type = options.type;
		// where each constraint is an object of the form
		// {method:'method',args:[]}
		this.constraints = options.constraints || [];
	};

	module.exports = {
		ObjectSchema : ObjectSchema,
		Type : Type,
		Property : Property
	};

}());
