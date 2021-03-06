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

/**
 * sample ObjectSchema:
 * 
 * <code>
 * {
 *		namespace : 'ns://runrightfast.co/config/couchbase',
 *		version : '1.0.0',
 *		description : 'RunRightFast Couchbase Config Schema',
 *		types : {
 *			Connection : {
 *				description : 'Connection Settings',
 *				properties : {
 *					port : {
 *						type : 'Number',										
 *						constraints : [ {										// each constraint maps to a Type method and defines how to invoke it
 *							method : 'required',									
 *							args : []
 *						},
 *						{method:'min', args:[8000]} ]
 *					},
 *					host : {
 *						type : 'String',
 *						constraints : [ {
 *							method : 'required',
 *							args : []
 *						} ]
 *					}
 *				}
 *			},
 *			EmailAlerts : {
 *				name : 'EmailAlerts',
 *				description : 'Email Alert Settings',
 *				properties : {
 *					emailAddresses: {
 *						type : 'Array',											// the Array type can be defined, e.g., emailAddresses is an Array of Strings that are email addresses  
 *						constraints: [											// - only homogeneous Array are currently supported
 *							{method:'includes',
 *							 args:[
 *								{type:'String',
 *								 constraints:[
 *									{method:'email',args:[]}
 *								 ]}
 *							 ]}	
 *						]
 *					}
 *				}
 *			}		 
 *		}
 *	}
 *
 *{
 *		namespace : 'ns://runrightfast.co/config/loggingService',
 *		version : '1.0.0',
 *		description : 'RunRightFast Logging Service Config Schema',
 *		types : {
 *			CouchbaseLoggingService : {
 *				description : 'Logging Service Config for Couchbase store',
 *				properties : {
 *					connection : { 										
 *						type : 'Object',
 *						description: 'The Couchbase connection config'										
 *						constraints : [ {										
 *							method : 'required',									
 *							args : []
 *						},
 *						{method:'objectSchemaType', 							// connection is referencing the 'Connection' Type that is defined in the ObjectSchem above
 *						 args:['ns://runrightfast.co/config/couchbase',
 * 							   '1.0.0',
 * 								'Connection']} ]
 *					},
 *					host : {
 *						type : 'String',
 *						constraints : [ {
 *							method : 'required',
 *							args : []
 *						} ]
 *					},
 *					connections:{												// connections is an Array of 'Connection's, which is a Type defined in the above ObjectSchema
 *						type:'Array',
 *						constraints:[
 *							method:'includes',
 *							args:[
 *								{type:'Object',
 *								 constraints:[
 *									{method:'objectSchemaType',
 *									 args:['ns://runrightfast.co/config/couchbase',
 *										  '1.0.0',
 *										  'Connection'
 *										 ]
 *									}
 *								 ]
 *								}
 *							]
 *						]
 *					}
 *				}
 *			}
 *		}
 *	}
 *
 * {
 *		namespace : 'ns://runrightfast.co/config/loggingService',
 *		version : '1.0.0',
 *		description : 'RunRightFast Logging Service Config Schema',
 *		types : {
 *			CouchbaseLoggingServer : {
 *				description : 'Logging Server',
 *				properties : {
 *					loggingService : { 										
 *						type : 'Object',
 *						typeArgs: [																			// typeArgs are used to specify an embedded Type for an Object
 *							{
 *								CouchbaseLoggingService : {
 *									description : 'Logging Service Config for Couchbase store',
 *									properties : {									
 *										host : {
 *											type : 'String',
 *											constraints : [ {
 *												method : 'required',
 *												args : []
 *											} ]
 *										},
 *										port : {
 *											type : 'Number',
 *											constraints : [ {
 *												method : 'required',
 *												args : []
 *											} ]
 *										}
 *									}
 *								}
 *							}
 *						]
 *						description: 'The Couchbase connection config'										
 *						constraints : [ {										
 *							method : 'required',									
 *							args : []
 *						}
 *					},
 *					host : {
 *						type : 'String',
 *						constraints : [ {
 *							method : 'required',
 *							args : []
 *						} ]
 *					},
 *					connections:{												// connections is an Array of 'Connection's, which is a Type defined in the above ObjectSchema
 *						type:'Array',
 *						constraints:[
 *							method:'includes',
 *							args:[
 *								{type:'Object',
 *								 constraints:[
 *									{method:'objectSchemaType',
 *									 args:['ns://runrightfast.co/config/couchbase',
 *										  '1.0.0',
 *										  'Connection'
 *										 ]
 *									}
 *								 ]
 *								}
 *							]
 *						]
 *					}
 *				}
 *			}
 *		}
 *	}
 * </code>
 */
(function() {
	'use strict';

	var Entity = require('runrightfast-commons').Entity;
	var util = require('util');
	var joi = require('joi');
	var types = joi.types;
	var lodash = require('lodash');
	var Hoek = require('hoek');
	var assert = Hoek.assert;
	var validatorUtils = require('./utils');

	var validateArrayType =
			function validateArrayType(obj) {
				var type = joi.types[obj.type]();
				lodash.forEach(obj.constraints, function(c) {
					if (c.method === 'includes' || c.method === 'excludes') {
						var schema = {
							type : joi.types.String().required(),
							constraints : joi.types.Array()
						};
						lodash.forEach(c.args, function(arg) {
							validatorUtils.validate(arg, schema);

							// reuse the validateProperty to validate the Array
							// element type
							try {
								validateProperty({
									type : arg.type,
									constraints : arg.constraints
								});
							} catch (err) {
								throw new Error('invalid Array element type:\n ' + JSON.stringify(arg, undefined, 2) + '\nwithin\n'
										+ JSON.stringify(obj, undefined, 2));
							}
						});
					} else {
						type = type[c.method].apply(type, c.args);
					}
				});
			};

	var validateObjectType = function validateObjectType(obj) {
		var type = joi.types[obj.type]();
		lodash.forEach(obj.constraints, function(c) {
			if (c.method === 'objectSchemaType') {
				var params = {
					namespace : c.args[0],
					version : c.args[1],
					type : c.args[2]
				};
				var objectSchemaTypeParamsSchema = {
					namespace : types.String().regex(/ns:\/\/[\w\W]+/).required(),
					version : types.String().regex(/\d+\.\d+\.\d+/).required(),
					type : types.String().required()
				};
				validatorUtils.validate(params, objectSchemaTypeParamsSchema);
			} else {
				type = type[c.method].apply(type, c.args);
			}
		});
	};

	var validateProperty = function validateProperty(obj) {
		var schema = {
			description : types.String(),
			type : types.String().required(),
			typeArgs : types.Array(),
			/**
			 * array of objects with following properties:
			 * 
			 * <pre>
			 * method 		REQUIRED - constraint method name
			 * args 		REQUIRED - args to be passed to the constraint method
			 * </pre>
			 */
			constraints : types.Array({
				method: types.String().required(),
				args: types.Array().required()
			})
		};
		validatorUtils.validate(obj, schema);
		assert(lodash.isFunction(joi.types[obj.type]), 'Unsupported type: ' + obj.type);
		if (obj.constraints) {
			switch (obj.type) {
			case 'Object':
				validateObjectType(obj);
				break;
			case 'Array':
				validateArrayType(obj);
				break;
			default:
				// check that the type is supported by Joi
				var type = joi.types[obj.type]();
				lodash.forEach(obj.constraints, function(c) {
					type = type[c.method].apply(type, c.args);
				});
			}
		}
	};

	var validateType = function validateType(obj) {
		var checkBoolean = function(value) {
			if (!lodash.isUndefined(value)) {
				assert(lodash.isBoolean(value));
			}
		};

		var schema = {
			description : types.String(),
			allowExtraKeys : types.Boolean(),
			skipFunctions : types.Boolean(),
			saveConversions : types.Boolean(),
			skipConversions : types.Boolean(),
			stripExtraKeys : types.Boolean(),
			properties : types.Object()
		};
		validatorUtils.validate(obj, schema);
		checkBoolean(obj.allowExtraKeys);
		checkBoolean(obj.skipFunctions);
		checkBoolean(obj.saveConversions);
		checkBoolean(obj.skipConversions);
		checkBoolean(obj.stripExtraKeys);
		if (obj.properties) {
			lodash.keys(obj.properties).forEach(function(key) {
				validateProperty(obj.properties[key]);
			});
		}
	};

	var validateObjectSchema = function validateObjectSchema(obj) {
		var schema = {
			namespace : types.String().regex(/ns:\/\/[\w\W]+/).required(),
			version : types.String().regex(/\d+\.\d+\.\d+/).required(),
			description : types.String().required(),
			types : types.Object(),
			allowExtraKeys : true
		};
		validatorUtils.validate(obj, schema);
		if (obj.types) {
			lodash.keys(obj.types).forEach(function(key) {
				validateType(obj.types[key]);
			});
		}
	};

	// /////////////// Type Class //////////////////////////
	/**
	 * @param options
	 * 
	 * <code>
	 * description		OPTIONAL - defaults to name
	 * properties 		REQUIRED - map of Property objects keyed by property name
	 * allowExtraKeys	OPTIONAL - By default Joi will throw an error on keys that are not specified in the configuration object. To force Joi to not throw errors when it encounters an unknown key, use the allowExtraKeys option
	 * skipFunctions	OPTIONAL - On occasion, an object must be validated which contains functions as properties. To force Joi to ignore validation on such functions, use the skipFunctions option
	 * saveConversions	OPTIONAL - Through the process of validation, some inputs will be converted to accommodate the various constraint functions. For example, if an input is of type Joi.Types.Number() but is defined as a string, the validator will convert to Number during validation. This does not persist and does not affect the original input.
	 * skipConversions	OPTIONAL - By default Joi tries to parse and convert object's values into correct type. You might want to disable this behaviour e.g. when you are validating program's internal objects instead of user input.
	 * stripExtraKeys	OPTIONAL - If you'd like Joi to remove the unknown keys from the object, enable both the stripExtraKeys option and the allowExtraKeys option
	 * </code>
	 */
	var Type = function Type(options) {
		validateType(options);
		this.description = options.description;
		this.allowExtraKeys = !!options.allowExtraKeys;
		this.skipFunctions = !!options.skipFunctions;
		this.saveConversions = !!options.saveConversions;
		this.skipConversions = !!options.skipConversions;
		this.stripExtraKeys = !!options.stripExtraKeys;
		this.properties = options.properties || {};
	};

	Type.prototype.validate = function(obj, getObjectSchemaFxn) {
		validatorUtils.validate(obj, this.getSchema(getObjectSchemaFxn));
	};

	/**
	 * One use case for this method is to pre-determine what ObjectSchema Types
	 * are referenced. At application initialization time, these schemas can be
	 * prefetched and cached in the ObjectSchemaRegistry.
	 * 
	 * @returns
	 */
	Type.prototype.getObjectSchemaTypeDependencies = function() {
		var self = this;
		var schemaDependencies = {};

		var prop, objectSchemaTypeConstraint;
		lodash.forEach(lodash.keys(this.properties), function(propKey) {
			prop = self.properties[propKey];
			if (prop.type === 'Object') {
				objectSchemaTypeConstraint = lodash.find(prop.constraints, function(constraint) {
					return constraint.method === 'objectSchemaType';
				});
				if (objectSchemaTypeConstraint) {
					schemaDependencies[objectSchemaTypeConstraint.args[0] + objectSchemaTypeConstraint.args[1] + objectSchemaTypeConstraint.args[2]] = {
						namespace : objectSchemaTypeConstraint.args[0],
						version : objectSchemaTypeConstraint.args[1],
						type : objectSchemaTypeConstraint.args[2]
					};
				}
			}
		});

		return lodash.values(schemaDependencies);
	};

	Type.prototype.getSchema = function(getObjectSchemaFxn) {
		var self = this;
		var schema = {
			allowExtraKeys : self.allowExtraKeys,
			skipFunctions : self.skipFunctions,
			saveConversions : self.saveConversions,
			skipConversions : self.skipConversions,
			stripExtraKeys : self.stripExtraKeys
		};
		var createType = function createType(type, constraints) {
			return lodash.foldl(constraints, function(type, constraint) {
				if (constraint.method === 'objectSchemaType') {
					type.objectSchemaType = function(namespace, version, type) {
						this.add('objectSchemaType', function(value, obj, key, errors, keyPath) {
							var objectShemaTypeKey = {
								namespace : namespace,
								version : version,
								type : type
							};
							var objectSchemaType = getObjectSchemaFxn(objectShemaTypeKey);
							if (objectSchemaType === null) {
								errors.add('Unknown ObjectSchema Type: ' + JSON.stringify(objectShemaTypeKey), keyPath);
								return false;
							}
							try {
								objectSchemaType.validate(value, getObjectSchemaFxn);
								return true;
							} catch (err) {
								errors.add(err.message, keyPath);
								return false;
							}

						}, arguments);

						return this;
					};
					return type.objectSchemaType(constraint.args[0], constraint.args[1], constraint.args[2]);
				}

				if (type.type === 'Array' && (constraint.method === 'includes' || constraint.method === 'excludes')) {
					var constraintMethodArgs = lodash.map(constraint.args, function(arg) {
						var arrayElementType = joi.types[arg.type]();
						return createType(arrayElementType, arg.constraints);
					});
					return type[constraint.method].apply(type, constraintMethodArgs);
				}

				return type[constraint.method].apply(type, constraint.args);
			}, type);
		};

		var createJoiType = function createJoiType(prop) {
			var joiType = joi.types[prop.type];
			if (prop.typeArgs) {
				if (prop.type === 'Object') {
					var type = new Type(prop.typeArgs[0]);
					return joiType(type.getSchema(getObjectSchemaFxn));
				}

				throw new Error("typeArgs is only supported for type : 'Object'");
			}
			return joiType();
		};

		var prop;
		lodash.forEach(lodash.keys(this.properties), function(propKey) {
			prop = self.properties[propKey];
			schema[propKey] = createType(createJoiType(prop), prop.constraints);
		});
		return schema;
	};

	// //////// Property Class /////////////////
	/**
	 * @param options
	 * 
	 * <code>
	 * description	OPTIONAL - defaults to name
	 * type			REQUIRED - must match one of the supported type names
	 * constraints	REQUIRED - Array of constraints, where each array element is an object defining the constraint: {method : 'method', args : []}
	 * 						 - the constraint method must be defined on the type
	 * 						   
	 * </code>
	 */
	var Property = function Property(options) {
		validateProperty(options);
		this.description = options.description;
		this.type = options.type;
		// where each constraint is an object of the form
		// {method:'method',args:[]}
		this.constraints = options.constraints || [];
	};

	// ////////// ObjectSchema Class ///////////////////
	var objectSchemaId = function(namespace, version) {
		var schema = {
			namespace : types.String().regex(/ns:\/\/[\w\W]+/).required(),
			version : types.String().regex(/\d+\.\d+\.\d+/).required()
		};
		validatorUtils.validate({
			namespace : namespace,
			version : version
		}, schema);
		return namespace + '/' + version;
	};

	var __objectSchemaType = 'ns://runrightfast-validator/ObjectSchema';

	/**
	 * Extends Entity, but the id is set to : namespace+'/'+version
	 * 
	 * @param options
	 * 
	 * <code>
	 * namespace		REQUIRED - must match the following regex: /ns:\/\/.+/
	 * version			REQUIRED - must follow semver spec, i.e., it must validate against regex : /\d+\.\d+\.\d+/
	 * description		REQUIRED
	 * types			OPTIONAL - map of schema types, keyed by the type name
	 * 
	 * </code>
	 */
	var ObjectSchema = function ObjectSchema(options) {
		Entity.call(this, options);
		validateObjectSchema(options);
		this.namespace = options.namespace;
		this.version = options.version;
		this.description = options.description;

		this.types = options.types || {};
		var self = this;
		lodash.keys(this.types).forEach(function(typeName) {
			self.types[typeName] = new Type(self.types[typeName]);

			// ensures that the Joi schema can be created
			self.types[typeName].getSchema();
		});
		this._entityType = __objectSchemaType;
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
	 * @param name
	 * @param type
	 * @throws Error
	 *             if type with the same name already exists
	 */
	ObjectSchema.prototype.addType = function(name, type) {
		assert(lodash.isString(name), 'name is required to a String');
		name = name.trim();
		assert(name.length > 0, 'name cannot be blank');
		if (this.types[name]) {
			throw new Error('type already exists: ' + JSON.stringify(this.types[name]));
		}
		validateType(type);		
		this.types[name] = type;
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
	 * @param name
	 * @param type
	 * @returns the pre-existing type or undefined
	 */
	ObjectSchema.prototype.setType = function(name, type) {
		assert(lodash.isString(name), 'name is required to a String');
		name = name.trim();
		assert(name.length > 0, 'name cannot be blank');
		validateType(type);
		var preExistingType = this.types[name];
		this.types[name] = type;
		return preExistingType;
	};
	// ////////// END - ObjectSchema Class ///////////////////

	var typesRegistry =
			{
				BaseType : {
					required : {
						description : 'Specifies that the input may not be undefined (unspecified).'
					},
					allow : {
						description : 'Specifies that the input may equal this value. This is type specific, so you cannot allow a number on a string type and vice-versa.',
						args : [ {
							type : types.Any()
						} ]
					},
					deny : {
						description : 'Specifies that the input may NOT equal this value.',
						args : [ {
							type : types.Any()
						} ]
					},
					valid : {
						description : 'Specifies an arbitrary number of valid values for this input. If one or more of inputs given do not match the basic type, an Error is raised.',
						args : [ {
							type : types.Array()
						} ]
					},
					invalid : {
						description : 'Specifies an arbitrary number of invalid values for this input. If one or more of inputs given do not match the basic type, an Error is raised.',
						args : [ {
							type : types.Array()
						} ]
					},
					"with" : {
						description : 'Specifies an arbitrary number of inputs that must also be supplied (a1..an) with this input.',
						args : [ {
							type : types.Array().includes(types.String())
						} ]
					},
					without : {
						description : 'Specifies an arbitrary number of inputs that cannot exist alongside this input (logical XOR).',
						args : [ {
							type : types.Array().includes(types.String())
						} ]
					},
					nullOk : {
						description : 'Specifies that the value is allowed to be null.'
					}
				},
				"String" : {
					emptyOk : {
						description : "Specifies that the input may be equal to '' (the empty string)."
					},
					min : {
						description : 'Specifies a minimum length for this input string, inclusive.',
						args : [ {
							type : types.Number()
						} ]
					},
					max : {
						description : 'Specifies a maximum length for this input string, inclusive.',
						args : [ {
							type : types.Number()
						} ]
					},
					alphanum : {
						description : 'Specifies that this input may only consist of alphanumeric characters.'
					},
					regex : {
						description : 'Specifies that this input matches the given RegExp pattern.',
						args : [ {
							type : types.String()
						} ]
					},
					email : {
						description : 'Specifies that this input is a valid email string.'
					},
					date : {
						description : 'Specifies that this input is a valid Date string (locale string but also accepts unix timestamp in milliseconds).'
					}
				},
				Number : {
					integer : {
						description : "Specifies that this input be a valid integer."
					},
					float : {
						description : "Specifies that this input be a valid float or double."
					},
					min : {
						description : 'Specifies a minimum value for this input, inclusive.',
						args : [ {
							type : types.Number()
						} ]
					},
					max : {
						description : 'Specifies a maximum value for this input, inclusive.',
						args : [ {
							type : types.Number()
						} ]
					}
				},
				"Boolean" : {},
				"Array" : {
					includes : {
						description : 'Specifies allowed types for the array value to include. The values of n1, n2, ... are Type Registry constraints (usually of other types).',
						args : [ {
							type : types.Array()
						} ]
					},
					excludes : {
						description : 'Specifies allowed types for the array value to exclude. The values of n1, n2, ... are Type Registry constraints (usually of other types).',
						args : [ {
							type : types.Array()
						} ]
					}
				},
				"Object" : {
					allowOtherKeys : {
						description : 'Specifies allowed types for the array value to include. The values of n1, n2, ... are Type Registry constraints (usually of other types).'
					},
					objectSchemaType : {
						description : 'Specifies that the property must validate against the references ObjectSchemaType',
						args : [ {
							namespace : types.String(),
							version : types.String(),
							type : types.String()
						} ]
					}
				},
				"Function" : {},
				"Any" : {}
			};

	module.exports = {
		ObjectSchema : ObjectSchema,
		Type : Type,
		Property : Property,
		typesRegistry : typesRegistry,
		objectSchemaId : objectSchemaId
	};

}());
