'use strict';


var preq   = require('preq');
var assert = require('../../utils/assert.js');
var server = require('../../utils/server.js');


if (!server.stopHookAdded) {
    server.stopHookAdded = true;
    after(() => server.stop());
}

describe('Exports into non mediawiki formats: ', function() {

    this.timeout(20000);

    before(function () { return server.start(); });

    describe('Exporting to bibtex: ', function() {
        it('bibtex from scraper', function() {
            return server.query('http://example.com', 'bibtex').then(function(res) {
                assert.status(res, 200);
                assert.checkBibtex(res, '\n@misc{noauthor_exa');
            });
        });

        it('bibtex from pubmed', function() {
            return server.query('http://www.ncbi.nlm.nih.gov/pubmed/14656957', 'bibtex').then(function(res) {
                assert.status(res, 200);
                assert.checkBibtex(res, '\n@article{chobanian_seventh_20');
            });
        });

        it('bibtex from pmid', function() {
            return server.query('14656957', 'bibtex').then(function(res) {
                assert.status(res, 200);
                assert.checkBibtex(res, '\n@article{chobanian_seventh_20');
            });
        });

    });

    describe('Exporting to zotero: ', function() {
        // May or may not come from zotero depending on version, but asking for it in Zotero format.
        it('doi', function() {
            return server.query('10.1007/11926078_68', 'zotero').then(function(res) {
                assert.status(res, 200);
                assert.deepEqual(res.body[0].title, 'Semantic MediaWiki');
                assert.deepEqual(!!res.body[0].accessDate, true, 'No accessDate present');
                assert.notDeepEqual(res.body[0].accessDate, 'CURRENT_TIMESTAMP', 'Access date uncorrected');
                assert.ok(res.body[0].creators);
            });
        });
        it('doi with ISSN', function() {
            return server.query('doi:10.1039/b309952k', 'zotero').then(function(res) {
                assert.status(res, 200);
                assert.deepEqual(!!res.body[0].accessDate, true, 'No accessDate present');
                assert.notDeepEqual(res.body[0].accessDate, 'CURRENT_TIMESTAMP', 'Access date uncorrected');
                assert.ok(res.body[0].creators);
                assert.ok(res.body[0].DOI);
                assert.deepEqual(res.body[0].ISSN, '1463-9084');
                assert.deepEqual(res.body[0].itemType, 'journalArticle', 'Wrong itemType; expected journalArticle, got' + res.body[0].itemType);
            });
        });
    });

    describe('Exporting to mwDeprecated no longer functioning : ', function() {
        it('Uses formerly correct parameter', function() {
            return server.query('10.1007/11926078_68', 'mwDeprecated').then(function(res) {
                assert.status(res, 400);
            }, function(err) {
                assert.checkError(err, 400, "Invalid format requested mwDeprecated");
            });
        });

    });
});

