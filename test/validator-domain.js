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
var joi = require('joi');

var validatorDomain = require('..').validatorDomain;
var ObjectSchema = validatorDomain.ObjectSchema;
var Type = validatorDomain.Type;
var Property = validatorDomain.Property;
var ObjectSchemaRegistry = require('..').ObjectSchemaRegistry;

var objectSchemaRegistry = new ObjectSchemaRegistry();
var getObjectSchemaType = objectSchemaRegistry.getSchemaType.bind(objectSchemaRegistry);

describe('Validator Domain', function() {

	describe('ObjectSchema', function() {
		it('must be constructed with options that have a valid namespace and version', function() {
			var options = {
				namespace : 'ns://runrightfast.co/couchbase',
				version : '1.0.0',
				description : 'Couchbase config schema'
			};

			var schema = new ObjectSchema(options);
			expect(schema.namespace).to.equal(options.namespace);
			expect(schema.version).to.equal(options.version);
			expect(!!schema.id).to.equal(true);
			expect(!!schema.createdOn).to.equal(true);
			expect(!!schema.updatedOn).to.equal(true);
			expect(lodash.isString(schema.id)).to.equal(true);
			expect(lodash.isDate(schema.createdOn)).to.equal(true);
			expect(lodash.isDate(schema.updatedOn)).to.equal(true);
			expect(!!schema.id).to.equal(true);
			expect(schema._entityType).to.equal('ns://runrightfast-validator/ObjectSchema');

			console.log('*** schema json: ' + JSON.stringify(schema));
		});

		it('constructor options.namespace format must match pattern: ns://namespace', function(done) {
			var options = {
				namespace : '//runrightfast.co/couchbase',
				version : '1.0.0',
				description : 'Couchbase config schema'
			};

			try {
				console.log(new ObjectSchema(options));
				done(new Error('expected validation error'));
			} catch (err) {
				console.log(err);
				expect(err._errors.length).to.equal(1);
				done();
			}

		});

		it('constructor options.version format must match pattern: x.x.x', function(done) {
			var options = {
				namespace : 'ns://runrightfast.co/couchbase',
				version : '1.0',
				description : 'Couchbase config schema'
			};

			try {
				console.log(new ObjectSchema(options));
				done(new Error('expected validation error'));
			} catch (err) {
				console.log(err);
				expect(err._errors.length).to.equal(1);
				done();
			}

		});

		it('constructor options.description is required', function(done) {
			var options = {
				namespace : 'ns://runrightfast.co/couchbase',
				version : '1.0.0'
			};

			try {
				console.log(new ObjectSchema(options));
				done(new Error('expected validation error'));
			} catch (err) {
				console.log(err);
				expect(err._errors.length).to.equal(1);
				done();
			}

		});

		it('constructor options are required', function(done) {
			try {
				console.log(new ObjectSchema());
				done(new Error('expected validation error'));
			} catch (err) {
				console.log(err);
				expect(err._errors.length).to.equal(3);
				done();
			}
		});

		it('can list the names of Types that it contains', function() {
			var options = {
				namespace : 'ns://runrightfast.co/couchbase',
				version : '1.0.0',
				description : 'Couchbase config schema'
			};

			var schema = new ObjectSchema(options);
			var typeNames = schema.getTypeNames();
			expect(lodash.size(typeNames)).to.equal(0);

			var name = 'CouchbaseConnectionSettings';
			var type = new Type({
				description : 'Couchbase Connection Settings'
			});

			schema.addType(name, type);
			expect(lodash.isObject(schema.getType(name))).to.equal(true);
			expect(lodash.contains(schema.getTypeNames(), name)).to.equal(true);
		});

		it('can remove a Type by name', function() {
			var options = {
				namespace : 'ns://runrightfast.co/couchbase',
				version : '1.0.0',
				description : 'Couchbase config schema'
			};

			var schema = new ObjectSchema(options);

			var name = 'CouchbaseConnectionSettings';
			var type = new Type({
				description : 'Couchbase Connection Settings'
			});

			schema.addType(name, type);
			expect(lodash.isObject(schema.getType(name))).to.equal(true);
			expect(lodash.contains(schema.getTypeNames(), name)).to.equal(true);
			var removedType = schema.removeType(name);
			expect(lodash.isObject(removedType)).to.equal(true);
		});

		it('a type with same name cannot be added twice', function(done) {
			var options = {
				namespace : 'ns://runrightfast.co/couchbase',
				version : '1.0.0',
				description : 'Couchbase config schema'
			};

			var schema = new ObjectSchema(options);

			var name = 'CouchbaseConnectionSettings';
			var type = new Type({
				description : 'Couchbase Connection Settings'
			});

			schema.addType(name, type);

			try {
				schema.addType(name, type);
				done(new Error('expected an Error to be thrown because a type with the same name already exists'));
			} catch (err) {
				done();
			}
		});

		it('#set - will replace existing types with the same name', function() {
			var options = {
				namespace : 'ns://runrightfast.co/couchbase',
				version : '1.0.0',
				description : 'Couchbase config schema'
			};

			var schema = new ObjectSchema(options);

			var name = 'CouchbaseConnectionSettings';
			var type = new Type({
				description : 'Couchbase Connection Settings'
			});

			schema.addType(name, type);
			var type2 = new Type({
				description : 'Couchbase Connection Settings - 2'
			});
			schema.setType(name, type2);
			expect(schema.getType(name).description).equal(type2.description);

		});

		it('validates that Array properties reference valid types', function(done) {
			try {
				console.log(new ObjectSchema({
					namespace : 'ns://runrightfast.co',
					version : '1.0.0',
					description : 'Couchbase config schema',
					types : {
						Connection : {
							description : 'Connection Settings',
							properties : {
								emails : {
									type : 'Array',
									constraints : [ {
										method : 'includes',
										args : [ {
											type : 'String',
											constraints : [ {
												method : 'email',
												args : []
											} ]
										} ]
									} ]
								},
								invalidProperty : {
									type : 'Array',
									constraints : [ {
										method : 'includes',
										args : [ {
											type : 'INVALID_TYPE',
											constraints : [ {
												method : 'email',
												args : []
											} ]
										} ]
									} ]
								}
							}
						}
					}
				}));
				done(new Error('expected error because invalidProperty Array type includes an invalid type'));
			} catch (err) {
				console.log(err);
				done();
			}
		});

		it('Object properties are allowed to have typeArgs', function(done) {

			var objectSchema = new ObjectSchema({
				namespace : 'ns://runrightfast.co',
				version : '1.0.0',
				description : 'Couchbase config schema',
				types : {
					CouchbaseConfig : {
						description : 'Couchbase Connection Configuration',
						properties : {
							conn : {
								type : 'Object',
								typeArgs : [ {
									description : 'Connection Settings',
									properties : {
										host : {
											type : 'String',
											constraints : [ {
												method : 'required',
												args : []
											} ]
										},
										port : {
											type : 'Number',
											constraints : [ {
												method : 'required',
												args : []
											}, {
												method : 'min',
												args : [ 0 ]
											} ]
										}
									}
								} ]
							}
						}
					}
				}
			});

			console.log('objectSchema :\n' + JSON.stringify(objectSchema, undefined, 2));

			var couchbaseConfig = objectSchema.getType('CouchbaseConfig');

			couchbaseConfig.validate({
				conn : {
					host : 'localhost',
					port : 8091
				}
			});

			try {
				couchbaseConfig.validate({
					conn : {
						host : 'localhost'
					}
				});
				done(new Error('expected validation to fail because conn.port is required'));
			} catch (err) {
				console.log(err);
				done();
			}

		});

		it('Only Object properties are allowed to have typeArgs', function(done) {

			try {
				console.log(new ObjectSchema({
					namespace : 'ns://runrightfast.co',
					version : '1.0.0',
					description : 'Couchbase config schema',
					types : {
						CouchbaseConfig : {
							description : 'Couchbase Connection Configuration',
							properties : {
								conn : {
									type : 'String',
									typeArgs : [ {
										description : 'Connection Settings',
										properties : {
											host : {
												type : 'String',
												constraints : [ {
													method : 'required',
													args : []
												} ]
											},
											port : {
												type : 'Number',
												constraints : [ {
													method : 'required',
													args : []
												}, {
													method : 'min',
													args : [ 0 ]
												} ]
											}
										}
									} ]
								}
							}
						}
					}
				}));

				done(new Error('expected validation to fail'));
			} catch (err) {
				console.log(err);
				done();
			}
		});
	});

	describe('Type', function() {

		it('can be constructed with a description and allowExtraKeys', function(done) {
			var options = {
				description : 'Couchbase Connection Settings',
				allowExtraKeys : true
			};

			var type = new Type(options);
			expect(type.description).to.equal(options.description);
			expect(type.allowExtraKeys).to.equal(options.allowExtraKeys);

			options.allowExtraKeys = false;
			type = new Type(options);
			expect(type.allowExtraKeys).to.equal(options.allowExtraKeys);

			options.allowExtraKeys = 'asdad';
			try {
				console.log(new Type(options));
				done(new Error('expected Type to fail validation because allowExtraKeys must be a boolean'));
			} catch (err) {
				done();
			}
		});

		it('can be constructed with a  description, and properties', function(done) {
			var options = {
				description : 'Couchbase Connection Settings',
				properties : {
					port : {
						type : 'Number',
						constraints : [ {
							method : 'required',
							args : []
						}, {
							method : 'min',
							args : [ 0 ]
						} ]
					},
					connection : {
						type : 'Object',
						constraints : [ {
							method : 'objectSchemaType',
							args : [ 'ns://runrightfast.co', '1.0.0', 'Connection' ]
						}, {
							method : 'optional',
							args : []
						} ]
					},
					alertEmails : {
						type : 'Array',
						constraints : [ {
							method : 'includes',
							args : [ {
								type : 'String',
								constraints : [ {
									method : 'email',
									args : []
								} ]
							} ]
						}, {
							method : 'required',
							args : []
						} ]
					},
					connections : {
						type : 'Array',
						constraints : [ {
							method : 'includes',
							args : [ {
								type : 'Object',
								constraints : [ {
									method : 'objectSchemaType',
									args : [ 'ns://runrightfast.co', '1.0.0', 'Connection' ]
								} ]
							} ]
						} ]
					}
				}
			};

			var objectSchema = new ObjectSchema({
				namespace : 'ns://runrightfast.co',
				version : '1.0.0',
				description : 'Couchbase config schema',
				types : {
					Connection : {
						description : 'Connection Settings',
						properties : {
							port : {
								type : 'Number',
								constraints : [ {
									method : 'required',
									args : []
								} ]
							},
							host : {
								type : 'String',
								constraints : [ {
									method : 'required',
									args : []
								} ]
							},
							emails : {
								type : 'Array',
								constraints : [ {
									method : 'includes',
									args : [ {
										type : 'String',
										constraints : [ {
											method : 'email',
											args : []
										} ]
									} ]
								} ]
							}
						}
					}
				}
			});

			try {
				objectSchemaRegistry.registerSchema(objectSchema);
				console.log('+++ registered schema');
			} catch (err) {
				throw new Error('registerSchema failed : ' + err);
			}

			var type;
			try {
				type = new Type(options);
			} catch (err) {
				throw new Error('failed to create Type: ' + err);
			}

			expect(type.description).to.equal(options.description);

			var schema = type.getSchema(getObjectSchemaType);
			expect(lodash.isObject(schema)).to.equal(true);
			console.log(schema);

			type.validate({
				port : 8000,
				alertEmails : [ 'azappala@email.com' ]
			}, getObjectSchemaType);

			type.validate({
				port : 8000,
				connection : {
					host : 'localhost',
					port : 8091
				},
				alertEmails : [ 'azappala@email.com' ]
			}, getObjectSchemaType);

			type.validate({
				port : 8000,
				connection : {
					host : 'localhost',
					port : 8091
				},
				alertEmails : [ 'azappala@email.com' ],
				connections : [ {
					host : 'localhost',
					port : 8091
				}, {
					host : 'localhost',
					port : 8092
				} ]
			}, getObjectSchemaType);

			try {
				type.validate({
					port : 8000,
					connection : {
						host : 'localhost',
						port : 8091
					}
				}, getObjectSchemaType);
				done(new Error('Expected validation to fail because alertEmails is required'));
				return;
			} catch (err) {
				console.log('Expected validation to fail because alertEmails is required: ' + err);
			}

			try {
				type.validate({
					port : 8000,
					alertEmails : [ 'azappala@email.com', 'invalid email' ]
				}, getObjectSchemaType);
				done(new Error('Expected validation to fail because alertEmails contains invalid emails'));
				return;
			} catch (err) {
				console.log('Expected validation to fail because alertEmails contains invalid emails: ' + err);
			}

			try {
				type.validate({}, getObjectSchemaType);
				done(new Error('Expected validation to fail because port is required'));
				return;
			} catch (err) {
				console.log('Expected validation to fail because port is required: ' + err);
			}

			try {
				type.validate({
					port : 'asdasd',
					alertEmails : [ 'azappala@email.com' ]
				}, getObjectSchemaType);
				done(new Error('Expected validation to faile because port must be a number'));
				return;
			} catch (err) {
				console.log('Expected validation to faile because port must be a number: ' + err);
			}

			try {
				type.validate({
					port : 8000,
					connection : {
						port : 8091
					},
					alertEmails : [ 'azappala@email.com' ]
				}, getObjectSchemaType);
				done(new Error('Expected validation to faile because connection.host is required'));
				return;
			} catch (err) {
				console.log('Expected validation to faile because connection.host is required: ' + err);
			}

			done();
		});

		it('validation will fail if a reference ObjectSchema Type cannot be retrieved', function(done) {
			var options = {
				description : 'Couchbase Connection Settings',
				properties : {
					connection : {
						type : 'Object',
						constraints : [ {
							method : 'objectSchemaType',
							args : [ 'ns://DOES_NOT_EXIST', '1.0.0', 'Connection' ]
						}, {
							method : 'required',
							args : []
						} ]
					}
				}
			};

			var type;
			try {
				type = new Type(options);
			} catch (err) {
				throw new Error('failed to create Type: ' + err);
			}

			expect(type.description).to.equal(options.description);

			var schema = type.getSchema(getObjectSchemaType);
			expect(lodash.isObject(schema)).to.equal(true);
			console.log(schema);

			try {
				type.validate({
					connection : {
						host : 'localhost',
						port : 8091
					}
				}, getObjectSchemaType);
				done(new Error('Expected validation to fail'));
			} catch (err) {
				console.log(err);
				done();
			}
		});

		it('#getSchemaDependencies returns the ObjectSchemas that a Type depends on', function() {
			var options = {
				description : 'Couchbase Connection Settings',
				properties : {
					connection1 : {
						type : 'Object',
						constraints : [ {
							method : 'objectSchemaType',
							args : [ 'ns://schema-1', '1.0.0', 'Connection' ]
						}, {
							method : 'required',
							args : []
						} ]
					},
					connection2 : {
						type : 'Object',
						constraints : [ {
							method : 'objectSchemaType',
							args : [ 'ns://schema-2', '1.0.0', 'Connection' ]
						}, {
							method : 'required',
							args : []
						} ]
					}
				}
			};

			var type = new Type(options);

			var dependencies = type.getObjectSchemaTypeDependencies();
			console.log(dependencies);
			expect(dependencies.length).to.equal(2);

			options.properties.connection2.constraints = options.properties.connection1.constraints;

			type = new Type(options);

			dependencies = type.getObjectSchemaTypeDependencies();
			console.log(dependencies);
			expect(dependencies.length).to.equal(1);

		});

	});

	describe('Property', function() {
		it('must be constructed with a type', function(done) {
			var options = {
				type : 'Number'
			};

			var property = new Property(options);
			expect(property.description).to.equal(options.name);
			expect(property.type).to.equal(options.type);

			try {
				console.log(new Property());
				done(new Property('Expected Error to be thrown because Property requires type'));
			} catch (err) {
				done();
			}
		});

		it('can be constructed with type constraints', function(done) {
			var options = {
				type : 'Number',
				constraints : [ {
					method : 'min',
					args : [ 0 ]
				}, {
					method : 'max',
					args : [ 10 ]
				} ]
			};

			var property = new Property(options);
			expect(property.type).to.equal(options.type);

			try {
				console.log(new Property());
				done(new Property('Expected Error to be thrown because Property requires type'));
			} catch (err) {
				done();
			}
		});

		it('can be constructed with type constraints that are valid', function(done) {
			var options = {
				type : 'Number',
				constraints : [ {
					method : 'min',
					args : [ 0 ]
				}, {
					method : 'maxXXX',
					args : [ 10 ]
				} ]
			};

			try {
				console.log(new Property(options));
				done(new Property('Expected Error to be thrown because Number.maxXXX is not a valid constraint'));
			} catch (err) {
				done();
			}
		});

		it('must be constructed with a name and type that is supported', function(done) {
			var options = {
				type : 'SDFSDFF'
			};

			try {
				console.log(new Property(options));
				done(new Property('Expected Error to be thrown because type is not supported'));
			} catch (err) {
				console.log(err);
				done();
			}
		});

	});

	describe('typesRegistry', function() {
		it('lists the types that are supported and the constraint functions each type supports', function() {
			var typesRegistry = validatorDomain.typesRegistry;
			console.log('typesRegistry:\n' + JSON.stringify(typesRegistry, undefined, 2));
		});

	});

	describe('Joi Array Type', function() {
		it('can validate that its elements only include certain types', function() {
			var schema = {
				array : joi.types.Array().includes(joi.types.String().min(5))
			};

			var obj = {
				array : [ '12345' ]
			};
			var err = joi.validate(obj, schema);
			if (err) {
				throw new Error(JSON.stringify(obj) + '\n' + err);
			}

			obj = {
				array : [ '1234' ]
			};
			err = joi.validate(obj, schema);
			if (!err) {
				throw new Error(JSON.stringify(obj) + '\n Should be invalid because it contains a String with length < 5');
			}

			obj = {
				array : [ 12345 ]
			};
			err = joi.validate(obj, schema);
			if (!err) {
				throw new Error(JSON.stringify(obj) + '\n Should be invalid because it contains an invalid type');
			}

		});

		/*
		 * TODO: this test fails, which is why it is skipped. It is a defect in
		 * Joi. According to its API, Joi should support heterogeneous Arrays,
		 * but apparently it does not. An issue has been submitted to the Joi
		 * project (https://github.com/spumko/joi/issues/133).
		 * 
		 */
		it.skip('can validate that its elements only include certain types', function(done) {
			var schema1 = {
				array : joi.types.Array().includes(joi.types.String().min(5), joi.types.Number().min(0))
			};

			var schema2 = {
				array : joi.types.Array().includes(joi.types.Number().min(0), joi.types.String().min(5))
			};

			var errors = [];

			var obj = {
				array : [ '12345' ]
			};
			var err = joi.validate(obj, schema1);
			if (err) {
				errors.push(new Error(JSON.stringify(obj) + ' : schema1 : ' + err));
			}
			err = joi.validate(obj, schema2);
			if (err) {
				errors.push(new Error(JSON.stringify(obj) + ' : schema2 : ' + err));
			}

			obj = {
				array : [ '1234' ]
			};
			err = joi.validate(obj, schema1);
			if (!err) {
				errors.push(new Error(JSON.stringify(obj) + ' : schema1 : Should be invalid because it contains a String with length < 5'));
			}
			err = joi.validate(obj, schema2);
			if (!err) {
				errors.push(new Error(JSON.stringify(obj) + ' : schema2 : Should be invalid because it contains a String with length < 5'));
			}

			obj = {
				array : [ 3 ]
			};
			err = joi.validate(obj, schema1);
			if (err) {
				errors.push(new Error(JSON.stringify(obj) + ' : schema1 : ' + err));
			}
			err = joi.validate(obj, schema2);
			if (err) {
				errors.push(new Error(JSON.stringify(obj) + ' : schema2 : ' + err));
			}

			obj = {
				array : [ '12345', 3 ]
			};
			err = joi.validate(obj, schema1);
			if (err) {
				errors.push(new Error(JSON.stringify(obj) + ' : schema1 : ' + err));
			}
			err = joi.validate(obj, schema2);
			if (err) {
				errors.push(new Error(JSON.stringify(obj) + ' : schema2 : ' + err));
			}

			if (errors.length > 0) {
				done(new Error(errors.join('\n')));
			} else {
				done();
			}

		});

		/*
		 * TODO: this test fails, which is why it is skipped. It is a defect in
		 * Joi. According to its API, Joi should support heterogeneous Arrays,
		 * but apparently it does not. An issue has been submitted to the Joi
		 * project (https://github.com/spumko/joi/issues/133).
		 */
		it.skip('should validate array of mixed Numbers & Strings', function() {
			var array = joi.types.Array, number = joi.types.Number, string = joi.types.String;

			var schema = {
				a : array().includes(number(), string())
			};
			var error;
			error = joi.validate({
				a : [ 1, 2, 3 ]
			}, schema);
			if (error) {
				throw new Error('[ 1, 2, 3 ]: ' + error);
			}

			error = joi.validate({
				a : [ 50, 100, 1000 ]
			}, schema);
			if (error) {
				throw new Error('[ 50, 100, 1000 ]:' + error);
			}

			error = joi.validate({
				a : [ 1, 'a', 5, 10 ]
			}, schema);
			if (error) {
				throw new Error("[ 1, 'a', 5, 10 ]: " + error);
			}

			error = joi.validate({
				a : [ 'walmart', 'everydaylowprices', 5000 ]
			}, schema);
			if (error) {
				throw new Error("[ 'walmart', 'everydaylowprices', 5000 ]: " + error);
			}

		});

	});

});