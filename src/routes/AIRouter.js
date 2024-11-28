const express =  require("express")
const routers = express.Router();
const aiController = require("../controller/AIController");

routers.post("/check_content_ai", aiController.checkEthicalStandards);

routers.get("/check_connect", aiController.checkConnection);

module.exports = routers;