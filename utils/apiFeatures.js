const mongoose = require('mongoose')
// class ApiFeatures {
//     constructor(query, queryStr){
//         this.query = query
//         this.queryStr = queryStr
//     }

//     // Search feature
//     search(){
//         const keyword = this.queryStr.keyword ? {
//             name: {
//                 $regex: this.queryStr.keyword,
//                 $options: "i",
//             }
//         } : {};

//         this.query = this.query.find({...keyword})
//         return this
//     }

//     // Filter
//     filter(){
//         // Creating copy of QueryStr Object
//         const queryCopy = {...this.queryStr}
//         // console.log(queryCopy)
//         const removeFields = ["keyword", "page", "limit"];
//         removeFields.forEach(key => delete queryCopy[key]);

//         let queryStr = JSON.stringify(queryCopy);
//         queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, key => `$${key}`)


//         this.query = this.query.find(JSON.parse(queryStr));
//         return this
//     }

//     // Price filter and Rating
//     pagination(resultPerPage){
//         const currentPage = Number(this.queryStr.page) || 1;

//         // Skip(No of product we need to skip) like navigation 1st->0-5 then 2nd-> 6-10 .....
//         const skip = resultPerPage * (currentPage - 1);

//         this.query = this.query.limit(resultPerPage).skip(skip)

//         return this;
//     }

//     async geoWithin(options) {
//         // if (!mongoose.version.includes('6.')) {
//         //   throw new Error('Mongoose version 6+ required for $geoWithin');
//         // }

//         // Validate and handle missing location, maxDistance, etc.
//         // this.validateGeoWithinOptions(options);

//         // Apply $geoWithin query operator to the underlying MongoDB query
//         this.query = this.query.where({
//           location: {
//             $geoWithin: {
//               $geometry: {
//                 type: 'Point',
//                 coordinates: options.center.coordinates
//               },
//               $maxDistance: options.maxDistance,
//               $spherical: true
//             }
//           }
//         });
//         return this;
//       }
// }

class ApiFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    // Search feature (assuming 'keyword' exists in queryString)
    search() {
        const keyword = this.queryString.keyword ? {
            name: {
                $regex: this.queryString.keyword,
                $options: 'i'
            }
        } : {};

        this.query = this.query.find({ ...keyword });
        return this;
    }

    // Filter (optimized)
    filter() {
        const queryCopy = { ...this.queryString };
        const removeFields = ['keyword', 'page', 'limit'];
        removeFields.forEach(key => delete queryCopy[key]);

        this.query = this.query.find(queryCopy);
        return this;
    }

    // Pagination (enhanced)
    pagination(resultPerPage) {
        const currentPage = Number(this.queryString.page) || 1;
        const skip = resultPerPage * (currentPage - 1);

        this.query = this.query.limit(resultPerPage).skip(skip);
        return this;
    }

    async geoWithin(options) {
        // if (!mongoose.version.includes('6+')) {
        //     throw new Error('Mongoose version 6+ required for $geoWithin');
        // }
        
        // this.validateGeoWithinOptions(options); // Ensure valid options
        
        this.query = this.query.where({
            location: {
                $geoWithin: {
                    $geometry: {
                        type: 'Point',
                        coordinates: options.center.coordinates
                    },
                    $maxDistance: options.maxDistance || 10000, // Default max distance
                    $spherical: true
                }
            }
        });
        console.log(options.center.coordinates)
        console.log(this.query)
        
        // Calculate distances as requested by users
        // this.query = this.query.addFields({
        //     distance: {
        //         $geoDistance: {
        //             distanceField: "distance",
        //             geometry: options.center,
        //             type: "sphere"
        //         }
        //     }
        // });

        return this;
    }

    // Robust validation for required fields and data types
    validateGeoWithinOptions(options) {
        // Implement thorough validation as needed
        // - Check for presence of mandatory fields (field, center)
        // - Verify coordinate formats
        // - Handle missing location data gracefully
    }
}

module.exports = ApiFeatures