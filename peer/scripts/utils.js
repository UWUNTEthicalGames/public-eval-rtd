export function readCSVFile(file, callback) {
	const reader = new FileReader();

	reader.onload = function (e) {
		const csvData = e.target.result;
		const lines = csvData.split('\n').map(line => line.split(','));
		callback(null, lines);
	};

	reader.onerror = function (e) {
		callback(e.target.error, null);
	};

	reader.readAsText(file);
}


export function parseCSVTextToObjArray(data, line_delimiter='\n', value_delimiter=',') {
	// Copied from https://www.30secondsofcode.org/js/s/csv-to-json/
	const titles = data.slice(0, data.indexOf(line_delimiter)).split(value_delimiter);
	return data
		.slice(data.indexOf(line_delimiter) + 1)
		.split(line_delimiter)
		.map(v => {
			const values = v.split(value_delimiter);
			return titles.reduce(
				(obj, title, index) => ((obj[title] = values[index]), obj),
				{}
			);
		}
	);
}


export function parseCSVTextToKeyedObj(data, key) {
	const obj_list = parseCSVTextToObjArray(data);
	
	const result = {};
	
	for (const row of obj_list) {
		result[row[key]] = row;
	}
	console.log(result);
	return result;
}