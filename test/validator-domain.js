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

var validatorDomain = require('..').validatorDomain;

describe('Validator Domain', function() {

	describe('ObjectScehma', function() {
		it('must be constructed with options that have a valid namespace and version', function() {
			var ObjectSchema = validatorDomain.ObjectSchema;

			var options = {
				namespace : 'ns://runrightfast.co/couchbase',
				version : '1.0.0'
			};

			var schema = new ObjectSchema(options);
			expect(schema.namespace).to.equal(options.namespace);
			expect(schema.version).to.equal(options.version);

		});

		it('constructor options.namespace format must match pattern: ns://namespace', function(done) {
			var ObjectSchema = validatorDomain.ObjectSchema;

			var options = {
				namespace : '//runrightfast.co/couchbase',
				version : '1.0.0'
			};

			try {
				new ObjectSchema(options);
				done(new Error('expected validation error'));
			} catch (err) {
				console.log(err);
				done();
			}

		});
	});

});