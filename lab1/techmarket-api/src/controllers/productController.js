const data = require(`../data/products`);

const getData = () => {
  return data;
};

const getDataById = (id) => {
  return data.find((item) => item.id == id);
};

const addData = (newData) => {
  data.push(newData);
};

const updateData = (id, updatedData) => {
    const numId = Number(id);
    const index = data.findIndex((item) => item.id === numId); 
    if (index !== -1) {

      Object.keys(updatedData).forEach(key => {
        data[index][key] = updatedData[key];
      });
      return true;
    }
    return false;
};

const deleteData = (id) => {
  const index = data.findIndex((item) => item.id === id);
  if (index !== -1) {
    data.splice(index, 1);
  }
};

module.exports = {
  getData,
  getDataById,
  addData,
  updateData,
  deleteData,
};
