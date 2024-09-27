const express =  require("express")
const routers = express.Router();
const pollController = require("../controller/PollController")

// Post http://localhost:3000/api/user/create_polling
// {
//     "authorId": "66cbc96d367aa89344e6c0d9",
//     "avatar": "http://example.com/avatar.jpg",
//     "title": "My bạn của tôi",
//     "description": "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Fugit vitae, .",
//     "timeCreate": "2024-09-02T08:00:00.000Z",
//     "timeStart": "2024-02-05T08:00:00.000Z",
//     "timeEnd": "2024-09-07T09:30:00.000Z",
//     "options": [
//         {
//             "contentOption": "Naruto",
//             "additonalContentOption":"",
//             "descriptionContentOption": "This is the first option."
//         },  
//         {
//             "contentOption": "Conan",
//             "additonalContentOption":"",
//             "descriptionContentOption": "This is the second option."
//         },
//         {
//             "contentOption": "React Js",
//             "additonalContentOption":"",
//             "descriptionContentOption": "This is the third option."
//         }
//     ],
//     "typeContent": "public"
// }
routers.post("/create_polling", pollController.createPolling)
// Get http://localhost:3000/api/user/find_all_polling/66cc0642f1858d86afad1666
routers.get("/find_all_polling_user/:authorId", pollController.findAllPollingUser)
// Get http://localhost:3000/api/user/find_all_polling/66cc0642f1858d86afad1666
routers.get("/find_all_polling", pollController.findAllPolling)
// Get http://localhost:3000/api/user/find_by_id_polling/66cc0642f1858d86afad1666
routers.get("/find_by_id_polling/:id", pollController.findByIdPolling)

module.exports = routers;