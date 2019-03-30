// DB ENDPOINT ROUTES
// ===============================================

const express = require('express');
const boom = require('boom');
const db = require('../components/db');
const axios = require('../components/axios');
const router = express.Router();

const fishBaseFaoAreasUrl = "https://fishbase.ropensci.org/faoareas/?limit=5000&AreaCode=18";
const fishBaseSpeciesUrl = "https://fishbase.ropensci.org/species/?limit=5000&offset=0";

const restaurantData = require('../json-files/restaurantdata.json');

const handleInsertOrUpdate = function (sqlQuery, res, values, next) {
    db.query(sqlQuery, [values], function (err, rows, fields) {
        if (err) {
            return next(boom.badImplementation(err));
        }

        res.status(200).send('SUCCESS: Data are inserted or updated successfully');
    });
};

/* GET. To update the faoareas table in the db */
router.get('/update/faoareas', function (req, res, next) {

    axios.getRequest(fishBaseFaoAreasUrl,
        function (response) {

            let jsonData = response.data;
            let values = [];

            for (let i = 0; i < jsonData.length; i++) {
                values.push([jsonData[i].autoctr, jsonData[i].AreaCode, jsonData[i].SpecCode, jsonData[i].StockCode,
                jsonData[i].Status, jsonData[i].Entered, jsonData[i].DateEntered,
                jsonData[i].Modified, jsonData[i].DateModified, jsonData[i].Expert,
                jsonData[i].DateChecked, jsonData[i].TS]);
            }

            //TODO: Need to figure out best way to store this long query
            let insertOrUpdateQuery = `INSERT INTO ebdb.FaoAreas (autoctr, AreaCode, SpecCode, StockCode, 
                                                                Status, Entered, DateEntered, Modified,
                                                                DateModified, Expert, DateChecked, TS) 
                                      VALUES ? ON DUPLICATE KEY UPDATE AreaCode = VALUES(AreaCode), SpecCode = VALUES(SpecCode),
                                                                       StockCode = VALUES(StockCode), Status = VALUES(Status),
                                                                       Entered = VALUES(Entered), DateEntered = VALUES(DateEntered),
                                                                       Modified = VALUES(Modified), DateModified = VALUES(DateModified),
                                                                       Expert = VALUES(Expert), DateChecked = VALUES(DateChecked),
                                                                       TS = VALUES(TS)`;

            return handleInsertOrUpdate(insertOrUpdateQuery, res, values, next);
        },
        function (err) {
            next(boom.badImplementation(err));
        });
});

/* GET. To update the species table in the db */
router.get('/update/species', function (req, res, next) {
    axios.getRequest(fishBaseSpeciesUrl,
        function (response) {

            let jsonData = response.data;
            let values = [];

            for (let i = 0; i < jsonData.length; i++) {
                values.push([jsonData[i].SpecCode, jsonData[i].Genus, jsonData[i].Species, jsonData[i].SpeciesRefNo,
                jsonData[i].Author, jsonData[i].FBname, jsonData[i].PicPreferredName,
                jsonData[i].FamCode, jsonData[i].Subfamily, jsonData[i].GenCode,
                jsonData[i].BodyShapeI, jsonData[i].Source, jsonData[i].TaxIssue,
                jsonData[i].Fresh, jsonData[i].Brack, jsonData[i].Saltwater,
                jsonData[i].DemersPelag, jsonData[i].Amphibious, jsonData[i].AnaCat,
                jsonData[i].MigratRef, jsonData[i].Vulnerability, jsonData[i].Length,
                jsonData[i].LTypeMaxM, jsonData[i].MaxLengthRef, jsonData[i].Weight,
                jsonData[i].UsedforAquaculture, jsonData[i].LifeCycle, jsonData[i].UsedasBait,
                jsonData[i].Aquarium, jsonData[i].Dangerous, jsonData[i].Electrogenic,
                jsonData[i].Comments, jsonData[i].Entered, jsonData[i].DateEntered,
                jsonData[i].Modified, jsonData[i].DateModified, jsonData[i].Expert,
                jsonData[i].DateChecked, jsonData[i].TS]);
            }

            //TODO: Need to figure out best way to store this long query
            const insertOrUpdateQuery = `INSERT INTO ebdb.Species (SpecCode, Genus, Species, SpeciesRefNo, 
                                                                Author, FBname, PicPreferredName, FamCode,
                                                                Subfamily, GenCode, BodyShapeI, Source,
                                                                TaxIssue, Fresh, Brack, Saltwater,
                                                                DemersPelag, Amphibious, AnaCat, MigratRef,
                                                                Vulnerability, Length, LTypeMaxM, MaxLengthRef,
                                                                Weight, UsedforAquaculture, LifeCycle, UsedasBait,
                                                                Aquarium, Dangerous, Electrogenic, Comments,
                                                                Entered, DateEntered, Modified, DateModified,
                                                                Expert, DateChecked, TS) 
                                      VALUES ? ON DUPLICATE KEY UPDATE Genus = VALUES(Genus), Species = VALUES(Species),
                                                                       SpeciesRefNo = VALUES(SpeciesRefNo), Author = VALUES(Author),
                                                                       FBname = VALUES(FBname), PicPreferredName = VALUES(PicPreferredName),
                                                                       FamCode = VALUES(FamCode), Subfamily = VALUES(Subfamily),
                                                                       GenCode = VALUES(GenCode), BodyShapeI = VALUES(BodyShapeI),
                                                                       TaxIssue = VALUES(TaxIssue), Fresh = VALUES(Fresh),
                                                                       Brack = VALUES(Brack), Saltwater = VALUES(Saltwater),
                                                                       DemersPelag = VALUES(DemersPelag), Amphibious = VALUES(Amphibious),
                                                                       AnaCat = VALUES(AnaCat), MigratRef = VALUES(MigratRef),
                                                                       Vulnerability = VALUES(Vulnerability), Length = VALUES(Length),
                                                                       LTypeMaxM = VALUES(LTypeMaxM), MaxLengthRef = VALUES(MaxLengthRef),
                                                                       Weight = VALUES(Weight), UsedforAquaculture = VALUES(UsedforAquaculture),
                                                                       LifeCycle = VALUES(LifeCycle), UsedasBait = VALUES(UsedasBait),
                                                                       Aquarium = VALUES(Aquarium), Dangerous = VALUES(Dangerous),
                                                                       Electrogenic = VALUES(Electrogenic), Comments = VALUES(Comments),
                                                                       Entered = VALUES(Entered), DateEntered = VALUES(DateEntered),
                                                                       Modified = VALUES(Modified), DateModified = VALUES(DateModified),
                                                                       Expert = VALUES(Expert), DateChecked = VALUES(DateChecked),
                                                                       TS = VALUES(TS)`;

            return handleInsertOrUpdate(insertOrUpdateQuery, res, values, next);
        },
        function (err) {
            next(boom.badImplementation(err));
        });

});

/* GET. To update the restaurant table in the db */
router.get('/update/restaurant', function (req, res, next) {

        let jsonData = restaurantData;
        let values = [];

        for (let i = 0; i < jsonData.length; i++) {
            values.push([jsonData[i].isValid, jsonData[i].location_id, jsonData[i].latitude, jsonData[i].longitude,
            jsonData[i].address_1, jsonData[i].address_2, jsonData[i].city,
            jsonData[i].province, jsonData[i].country, jsonData[i].postal_code,
            jsonData[i].phone_number, jsonData[i].phone_number_extension, jsonData[i].website,
            jsonData[i].partner_name, jsonData[i].partner_category, jsonData[i].partner_type,
            jsonData[i].fishchoice]);
        }

        //TODO: Need to figure out best way to store this long query
        const insertOrUpdateQuery = `INSERT INTO ebdb.Restaurant (isValid, location_id, latitude, longitude, 
                                                                  address_1, address_2, city, province,
                                                                  country, postal_code, phone_number, phone_number_extension,
                                                                  website, partner_name, partner_category, partner_type,
                                                                  fishchoice) 
                                      VALUES ? ON DUPLICATE KEY UPDATE isValid = VALUES(isValid), location_id = VALUES(location_id),
                                                                       latitude = VALUES(latitude), longitude = VALUES(longitude),
                                                                       address_1 = VALUES(address_1), address_2 = VALUES(address_2),
                                                                       city = VALUES(city), province = VALUES(province),
                                                                       country = VALUES(country), postal_code = VALUES(postal_code),
                                                                       phone_number = VALUES(phone_number), 
                                                                       phone_number_extension = VALUES(phone_number_extension),
                                                                       website = VALUES(website), partner_name = VALUES(partner_name),
                                                                       partner_category = VALUES(partner_category), 
                                                                       partner_type = VALUES(partner_type), fishchoice = VALUES(fishchoice)`;

        return handleInsertOrUpdate(insertOrUpdateQuery, res, values, next);
});

 module.exports = router;