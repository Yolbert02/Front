const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.json');

if (!fs.existsSync(dbPath)) {
    const initialData = {
        users: [],
        officers: [],
        complaints: [],
        assignments: [],
        zones: []
    };
    fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
}

const rawData = fs.readFileSync(dbPath);
const database = JSON.parse(rawData);

const users = database.users;
const officers = database.officers;
const complaints = database.complaints;
const assignments = database.assignments;
const zones = database.zones;

const saveData = () => {
    const dataToSave = {
        users,
        officers,
        complaints,
        assignments,
        zones
    };
    fs.writeFileSync(dbPath, JSON.stringify(dataToSave, null, 2));
};

module.exports = {
    users,
    officers,
    complaints,
    assignments,
    zones,
    saveData
};
