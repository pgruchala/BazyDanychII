const data = require(`../data/products`)


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
    const index = data.findIndex((item) => item.id === id);
    if (index) {
        data[index] = { ...data[index], ...updatedData };
    }
};

const deleteData = (id) => {
    const index = data.findIndex((item) => item.id === id);
    if (index) {
        data.splice(index, 1);
    }
}



module.exports = {
    getData,
    getDataById,
    addData,
    updateData,
    deleteData,
};