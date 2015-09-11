'use strict';

/**
 * Tests for when Zotero is down/inaccessible
 */

var preq   = require('preq');
var assert = require('../../utils/assert.js');
var server = require('../../utils/server.js');


describe('unreachable Zotero service', function() {

	this.timeout(40000);

	// Give Zotero port which is it is not running from-
	// Mimics Zotero being down.
	before(function () { return server.start({zoteroPort:1971}); });

	// PMID on NIH website that is not found in the id converter api
	// This will fail when Zotero is disabled because we no longer directly scrape pubMed central URLs,
	// as they have blocked our UA in the past.
	it('PMID not in doi id converter api', function() {
		var pmid = '14656957';
		return server.query(pmid, 'mediawiki', 'en')
		.then(function(res) {
			assert.status(res, 404);
		}, function(err) {
			assert.checkError(err, 404, 'Unable to locate resource with pmid ' + pmid,
				'Unexpected error message ' + err.body.Error);
		});
	});

	// PMID on NIH website that is found in the id converter api- should convert to DOI
	it('PMCID present in doi id converter api', function() {
		return server.query('PMC3605911').then(function(res) {
			assert.status(res, 200);
			assert.checkZotCitation(res, 'Viral Phylodynamics');
			assert.deepEqual(!!res.body[0].PMCID, true, 'Missing PMCID');
			assert.deepEqual(!!res.body[0].DOI, true, 'Missing DOI');
			assert.deepEqual(!!res.body[0].ISSN, false, 'Should not contain ISSN'); // This indicates Zotero is actually activated since ISSN is not in crossRef, where we're obtaining the metadata
			assert.deepEqual(res.body[0].itemType, 'journalArticle', 'Wrong itemType; expected journalArticle, got' + res.body[0].itemType);
		});
	});

	// JSTOR page with tabs in natively scraped title
	it('JSTOR page with tabs in natively scraped title', function() {
		return server.query('http://www.jstor.org/discover/10.2307/3677029').then(function(res) {
			assert.status(res, 200);
			assert.checkZotCitation(res, 'Flight Feather Moult in the Red-Necked Nightjar Caprimulgus ruficollis');
			assert.deepEqual(!!res.body[0].DOI, true, 'Missing DOI');
			assert.deepEqual(!!res.body[0].ISSN, false, 'Should not contain ISSN'); // This indicates Zotero is actually activated since ISSN is not in crossRef, where we're obtaining the metadata
			assert.deepEqual(res.body[0].itemType, 'journalArticle', 'Wrong itemType; expected journalArticle, got' + res.body[0].itemType);
		});
	});

});