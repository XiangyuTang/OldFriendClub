export const noBg = 'https://upload.techgp.cn/production/2021/2/9/16128469932484.png';
let leftHeight = 0;
let rightHeight = 0;

function clearHeight() {
  leftHeight = 0;
  rightHeight = 0;
}

function addHeightArray(addedStyleArr, attribute) {
  // return Promise.all(oriArr.map((item, index) => {
  //   if (item[attribute] === '') {
  //     item[attribute] = noBg;
  //   }
  //   return wx.getImageInfo({
  //     src: item[attribute]
  //   }).then((img) => {
  //     item['itemStyle'] = {
  //       width: img.width,
  //       height: img.height
  //     }
  //     return item;
  //   })
  // })).then((addedStyleArr) => {
    const pageWidth = wx.getSystemInfoSync().windowWidth;
    const standardWidth = ((pageWidth - 10) / 2) - 10;
    for (let i = 0; i < addedStyleArr.length; i++) {
      const itemOriWidth = addedStyleArr[i].club_back_img_width;
      const itemOriHeight = addedStyleArr[i].club_back_img_height;
      const radio = standardWidth / itemOriWidth;
      const itemRealHeight = itemOriHeight * radio;

      if (leftHeight <= rightHeight) {
        leftHeight = leftHeight + itemRealHeight + 10;
        addedStyleArr[i].direction = 'left';
      } else {
        rightHeight = rightHeight + itemRealHeight + 10;
        addedStyleArr[i].direction = 'right';
      }
      addedStyleArr[i]['itemStyle'] = {
        realHeight: itemRealHeight,
        realWidth: standardWidth
      }
    }
    return addedStyleArr;
  // })
}

module.exports = {
  addHeightArray,
  clearHeight
}
