/**
 * @name 水印生成器
 * @version 0.0.0.3-alpha
 * @author SakuraMikku
 * @description 用于生成水印
 * @createTime 2024-12-2
 * @updateTime 2024-12-6
 */

// 获取DOM元素
var canvas = document.getElementById("watermarkCanvas");
var ctx = canvas.getContext("2d");

//公共部分
const textInput = document.getElementById("text");
const charAlpha = document.getElementById("charAlpha");
const fontSizeInput = document.getElementById("fontSize");

//全屏水印
const speedInput = document.getElementById("speed");
const angleInput = document.getElementById("angle");
const targetRowsInput = document.getElementById("targetRows");
const charSpacingInput = document.getElementById("charSpacing");
const confirmButton = document.getElementById("confirm");
const defaultDiv = document.getElementById("default");
const backgroundDiv = document.getElementById("background");
const watermarkStyleSelect = document.getElementById("watermarkStyleSelect");
const randomSpacingSelect = document.getElementById("ramdomSpacingSelect");

//固定位置
const fixedMarkPositionXInput = document.getElementById("fixedX");
const fixedMarkPositionYInput = document.getElementById("fixedY");

//环形水印
const circleCenterXInput = document.getElementById("circleCenterX");
const circleCenterYInput = document.getElementById("circleCenterY");
const circleRadiusInput = document.getElementById("radius");
const circularSpeedInput = document.getElementById("circularSpeed");
const circleRingCountInput = document.getElementById("ringCount");
const circleCharSpacingCircularInput = document.getElementById(
  "charSpacingCircular"
);

//后缀名称列表
const fileSuffixObj = {
  mp4: {
    type: "video/mp4",
    suffix: "mp4",
  },
  webm: {
    type: "video/webm",
    suffix: "webm",
  },
};

let isRecording = false;

// 用于存储当前的动画帧请求ID
let animationFrameId;

// 用于存储媒体录制器和录制的数据块
let mediaRecorder,
  recordedChunks = [];

// 水印移动的偏移量
let offset = 0;

// 检查是否支持 MediaRecorder API
function checkMediaRecorderSupport() {
  if (!("MediaRecorder" in window)) {
    alert("您的浏览器不支持录制功能，请手动录制视频。");
    // 可以在这里禁用相关的UI元素，防止用户尝试使用不可用的功能
    return false;
  }
  return true;
}

// 初始化画布
function initCanvas() {
  // 重置 canvas 和 ctx
  const bg = document.querySelector("#background");
  if (bg.querySelector("#watermarkCanvas")) {
    bg.removeChild(bg.querySelector("#watermarkCanvas"));
  }
  const canv = document.createElement("canvas");
  canv.id = "watermarkCanvas";
  bg.appendChild(canv);
  canvas = document.querySelector("#watermarkCanvas");
  ctx = canvas.getContext("2d");

  // 重置偏移量
  offset = 0;

  // 调整 canvas 的大小
  resizeCanvas();

  // 填充整个 canvas 为绿色
  ctx.fillStyle = "green"; // 绿色
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// 监听watermarkStyleSelect的变化
watermarkStyleSelect.addEventListener("change", function () {
  updateControls(this.value);
});

// 更新控件显示状态
function updateControls(style) {
  const fullScreenOnlyElements = document.querySelectorAll(".full-screen-only");
  const fixedWatermarkParams = document.querySelector(
    ".fixed-watermark-params"
  );
  const circularWatermarkParams = document.querySelector(
    ".circular-watermark-params"
  );

  // 根据所选的水印类型显示/隐藏相应的元素
  if (style === "1") {
    // 全屏水印
    fullScreenOnlyElements.forEach((el) => (el.style.display = ""));
    fixedWatermarkParams.style.display = "none";
    circularWatermarkParams.style.display = "none";
  } else if (style === "2") {
    // 固定位置水印
    fullScreenOnlyElements.forEach((el) => (el.style.display = "none"));
    fixedWatermarkParams.style.display = "";
    circularWatermarkParams.style.display = "none";
  } else if (style === "3") {
    // 环形水印
    fullScreenOnlyElements.forEach((el) => (el.style.display = "none"));
    fixedWatermarkParams.style.display = "none";
    circularWatermarkParams.style.display = "";
  } else {
    // 其他类型的水印
    fullScreenOnlyElements.forEach((el) => (el.style.display = "none"));
    fixedWatermarkParams.style.display = "none";
    circularWatermarkParams.style.display = "none";
  }
}

// 默认情况下，如果不是全屏水印，则隐藏全屏水印特有的参数
const fullScreenOnlyElements = document.querySelectorAll(".full-screen-only");
fullScreenOnlyElements.forEach((el) => (el.style.display = "none"));

// 默认情况下，隐藏固定位置水印和环形水印的参数
const fixedWatermarkParams = document.querySelector(".fixed-watermark-params");
const circularWatermarkParams = document.querySelector(
  ".circular-watermark-params"
);
fixedWatermarkParams.style.display = "none";
circularWatermarkParams.style.display = "none";

// 调整 canvas 的大小
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas(); // 初始设置

// 绘制水印
function drawWatermarks(param) {
  //text, fontSize, speed, angle, targetRows, charSpacing, alpha, watermarkStyle

  if (param.watermarkStyle === 1) {
    drawWatermarksTypeOne(param);
  } else if (param.watermarkStyle === 2) {
    drawWatermarksTypeTwo(param);
  } else if (param.watermarkStyle === 3) {
    drawWatermarksTypeThree(param);
  } else if (param.watermarkStyle === 4) {
  } else if (param.watermarkStyle === 5) {
  } else if (param.watermarkStyle === 6) {
  }
  // 请求下一帧
  animationFrameId = requestAnimationFrame(() => drawWatermarks(param));
}

//全屏水印
function drawWatermarksTypeOne(param) {
  let text = param.text;
  let fontSize = param.fontSize;
  let speed = param.speed;
  let angle = param.angle;
  let targetRows = param.targetRows;
  let charSpacing = param.charSpacing;
  let alpha = param.alpha;
  let randomSpacing = param.randomSpacing || 0; // 默认值为0，表示不随机

  // 清除画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "green";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 设置字体样式
  ctx.font = `${fontSize}px Arial`;
  ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  // 计算旋转中心点
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((angle * Math.PI) / 180); // 倾斜角度

  let textWidth = ctx.measureText(text).width;

  // 计算每行可以放置多少个文本实例
  const lineHeight = (canvas.height + fontSize) / targetRows; // 行间距

  for (let y = -canvas.height; y < canvas.height; y += lineHeight) {
    let x = (y - offset) * Math.tan((angle * Math.PI) / 180);

    // 确定起始x坐标，并在水平方向上重复绘制
    let startX = x - textWidth / 2;
    while (startX < canvas.width + textWidth) {
      // 继续绘制直到填满整个宽度
      ctx.fillText(text, startX, y);

      // 根据 randomSpacing 参数决定是否使用随机间距
      if (randomSpacing === 1) {
        // 生成一个基于 charSpacing 的随机间距
        let spacing = charSpacing + (Math.random() * 20 - 10); // 随机范围为 [-10, 10]
        startX += textWidth + spacing; // 增加随机字符间距
      } else {
        startX += textWidth + charSpacing; // 使用固定字符间距
      }
    }
  }
  ctx.restore();
  // 更新偏移量
  offset += speed;
}

//固定位置水印
function drawWatermarksTypeTwo(param) {
  // 清除画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "green";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = `${param.fontSize}px Arial`;
  ctx.fillStyle = `rgba(255, 255, 255, ${param.alpha})`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  // 计算文本宽度
  let textWidth = ctx.measureText(param.text).width;

  // 在指定位置绘制水印
  ctx.fillText(
    param.text,
    param.fixedMarkPositionX - textWidth / 2, // 水平居中
    param.fixedMarkPositionY
  );
}

let lastTime = 0;
// 绘制环形水印
function drawWatermarksTypeThree(param) {
  // 清除画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "green";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  let fontSize = param.fontSize;
  let charSpacing = param.circleCharSpacing;
  const text = param.text;
  const centerX = param.circleCenterX;
  const centerY = param.circleCenterY;
  const radius = param.circleRadius;
  const ringCount = param.circleRingCount;
  const circularSpeed = param.circularSpeed;

  // 更新偏移量
  offset += circularSpeed;

  for (let ring = 0; ring < ringCount; ring++) {
    var currentRadius = radius + ring * (radius / ringCount); // 当前环的半径

    // 计算每个字符的宽度
    ctx.font = `${fontSize}px Arial`;
    var textWidth = ctx.measureText(text).width;
    var charsPerCircle = Math.floor(
      (2 * Math.PI * currentRadius) / (textWidth + charSpacing)
    );

    // 如果字符数量不足以形成完整的环，则减少字符间距或字体大小
    while (charsPerCircle < text.length) {
      if (charSpacing > 1) {
        // 尝试减小字符间距
        charSpacing -= 1;
      } else if (fontSize > 5) {
        // 如果字符间距已经很小，尝试减小字体大小
        fontSize -= 1;
        ctx.font = `${fontSize}px Arial`;
        textWidth = ctx.measureText(text).width;
      } else {
        break; // 字体大小和间距都已达到最小值，退出循环
      }
      var newCharsPerCircle = Math.floor(
        (2 * Math.PI * currentRadius) / (textWidth + charSpacing)
      );
      if (newCharsPerCircle >= text.length) break; // 如果现在可以放下所有字符，跳出循环
    }

    // 生成随机的起始角度偏移量
    var randomOffset = Math.random() * 2 * Math.PI - Math.PI; // 随机角度偏移量

    // 绘制每个字符
    for (let i = 0; i < text.length; i++) {
      var angle =
        (i / text.length) * 2 * Math.PI +
        randomOffset +
        (offset * Math.PI) / 180; // 角度
      var x = centerX + currentRadius * Math.cos(angle);
      var y = centerY + currentRadius * Math.sin(angle);

      // 绘制单个字符
      ctx.fillText(text[i], x, y);
    }
  }
}

// 开始录制
function startRecording() {
  let fileSuffix = document.querySelector("#fileSuffixSelect").value;
  const stream = canvas.captureStream();
  isRecording = true;
  recordedChunks = [];
  mediaRecorder = new MediaRecorder(stream, {
    mimeType: fileSuffixObj[fileSuffix].type,
  });
  mediaRecorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };
  mediaRecorder.start();
}

// 停止录制并保存
function stopRecordingAndSave() {
  isRecording = false;
  mediaRecorder.stop();

  mediaRecorder.onstop = () => {
    let fileSuffix = document.querySelector("#fileSuffixSelect").value;
    const blob = new Blob(recordedChunks, {
      type: fileSuffixObj[fileSuffix].type,
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    let fileName = document.querySelector("#fileNameInput").value;
    if (fileName === "" || fileName === null) {
      fileName = "水印";
    }
    a.download = fileName + "." + fileSuffixObj[fileSuffix].suffix;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  };
}

// 确认按钮点击事件处理程序
confirmButton.onclick = function () {
  let param = {};
  param.text = textInput.value;
  param.fontSize = parseInt(fontSizeInput.value, 10);
  param.watermarkStyle = parseInt(watermarkStyleSelect.value);
  param.alpha = parseFloat(charAlpha.value);
  if (param.watermarkStyle === 1) {
    param.speed = parseFloat(speedInput.value);
    param.angle = parseFloat(angleInput.value);
    param.targetRows = parseInt(targetRowsInput.value, 10);
    param.charSpacing = parseInt(charSpacingInput.value, 10);
    param.randomSpacing = parseInt(randomSpacingSelect.value);
  } else if (param.watermarkStyle === 2) {
    param.fixedMarkPositionX = parseFloat(fixedMarkPositionXInput.value);
    param.fixedMarkPositionY = parseFloat(fixedMarkPositionYInput.value);
  } else if (param.watermarkStyle === 3) {
    param.circleCenterX = parseFloat(circleCenterXInput.value);
    param.circleCenterY = parseFloat(circleCenterYInput.value);
    param.circleRadius = parseFloat(circleRadiusInput.value);
    param.circularSpeed = parseFloat(circularSpeedInput.value);
    param.circleRingCount = parseFloat(circleRingCountInput.value);
    param.circleCharSpacing = parseFloat(circleCharSpacingCircularInput.value);
  } else if (param.watermarkStyle === 4) {
  }

  defaultDiv.style.display = "none";
  backgroundDiv.style.display = "block";

  // 开始绘制水印
  drawWatermarks(param);
};

// 键盘事件处理程序
document.addEventListener("keydown", function (event) {
  if (event.key === "s" || event.key === "S") {
    startRecording(); // 开始录制
  } else if (
    (event.key === "Escape" || event.key === "~" || event.key === "`") &&
    backgroundDiv.style.display === "block"
  ) {
    backgroundDiv.style.display = "none";
    defaultDiv.style.display = "block";
    if (event.key === "Escape" && isRecording === true) {
      stopRecordingAndSave(); // 结束录制并保存视频
    } else if (event.key === "Escape" && isRecording === false) {
      stopRecordingWithoutSaving();
    } else if (event.key === "~" || event.key === "`") {
      stopRecordingWithoutSaving(); // 结束录制但不保存视频
    }

    // 取消之前的动画帧请求
    cancelAnimationFrame(animationFrameId);

    // 重置 canvas
    initCanvas();
  }
});

// 停止录制但不保存
function stopRecordingWithoutSaving() {
  if (isRecording === true) {
    mediaRecorder.stop();
    mediaRecorder.onstop = () => {
      recordedChunks = []; // 清空录制数据
    };
  }
}

// 初始化控件显示状态
function initControls() {
  // 默认选择全屏水印
  const defaultWatermarkStyle = "1";
  updateControls(defaultWatermarkStyle);
}

// 页面加载时执行的初始化函数
function initialize() {
  // 检查是否支持 MediaRecorder API
  if (!checkMediaRecorderSupport()) {
    return; // 如果不支持，直接返回
  }

  // 初始化控件显示状态
  initControls();
}

// 执行初始化
initialize();
