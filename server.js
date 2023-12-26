const dotenv = require("dotenv");
var cors = require("cors");
dotenv.config({ path: "./config.env" });

const app = require("./app");
app.use(cors());
//nhìn chung là không hiểu cái cors này làm cái gì, vì yêu cầu đề bài có cái này nên thêm vô chứ thấy không cần thiết, nói chung là cần hỏi lại

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`app running on port ${port}...`);
});
