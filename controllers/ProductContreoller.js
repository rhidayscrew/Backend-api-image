import Product from "../models/ProductModel.js";
import path from "path";
import fs from "fs";

export const getProducts = async (req, res) => {
  try {
    const response = await Product.findAll();
    //res.json(response);
    res.status(200).header("Content-Type", "application/json").json({
      code: "200",
      status: "OK",
      data: response,
    });
  } catch (error) {
    // console.log(error.message);
    res.status(500).json({
      code: "500",
      status: "Internal Server Erro",
      message: "Terjadi kesalahan pada server",
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const response = await Product.findOne({
      where: {
        id: req.params.id,
      },
    });
    // res.json(response);
    res.status(200).header("Content-Type", "application/json").json({
      code: "200",
      status: "OK",
      data: response,
    });
  } catch (error) {
    // console.log(error.message);
    res.status(500).json({
      code: "500",
      status: "Internal Server Error",
      message: "Terjadi kesalahan pada server",
    });
  }
};

export const saveProduct = async (req, res) => {
  try {
    if (req.files === null)
      return res.status(400).json({
        code: "400",
        status: "Bad Request",
        message: "No File Uploaded",
      });
    const { name, hbeli, hjual } = req.body;
    //const name = req.body.title;
    const file = req.files.file;
    const fileSize = file.data.length;
    const ext = path.extname(file.name);
    const fileName = file.md5 + ext;
    const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
    const allowedType = [".png", ".jpg", ".jpeg"];

    if (!allowedType.includes(ext.toLowerCase()))
      return res.status(422).json({
        code: "422",
        status: "Bad Request",
        message: "Invalid Images",
      });
    if (fileSize > 5000000)
      return res.status(422).json({
        code: "422",
        status: "Bad Request",
        message: "Image must be less than 5 MB",
      });
    file.mv(`./public/images/${fileName}`, (err) => {
      if (err) return res.status(500).json({ msg: err.message });
    });

    // Validasi field name, stock, harga_beli, dan harga_jual
    const error = {};

    if (!name) {
      error.name = "Nama produk harus diisi";
    } else if (name.length < 3) {
      error.name = "Nama produk terlalu pendek";
    }
    if (!hbeli || hbeli <= 0) {
      error.hbeli = "Harga beli produk harus diisi dengan angka lebih dari 0";
    }
    if (!hjual || hjual <= 0) {
      error.hjual = "Harga jual produk harus diisi dengan angka lebih dari 0";
    } else if (hjual <= hbeli) {
      error.hjual = "Harga jual produk harus lebih tinggi daripada harga beli";
    }
    // Jika terdapat error validasi, kirim respons error
    if (Object.keys(error).length > 0) {
      return res.status(422).json({
        code: "422",
        status: "Bad Request",
        errors: error,
      });
    }
    await Product.create({
      name: name,
      hbeli: hbeli,
      hjual: hjual,
      image: fileName,
      url: url,
    });
    res.status(201).json({
      code: "201",
      status: "Ok",
      messege: "Product Created Successfuly",
    });
  } catch (error) {
    // Tangani error umum dengan status 500
    // console.error(error);
    res.status(500).json({
      code: "500",
      status: "Internal Server Erro",
      message: "Terjadi kesalahan pada server",
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!product)
      return res.status(404).json({
        code: "404",
        status: "Not Found",
        message: "Data tidak di temukan",
      });

    let fileName = "";
    if (req.files === null) {
      fileName = product.image;
    } else {
      const file = req.files.file;
      const fileSize = file.data.length;
      const ext = path.extname(file.name);
      fileName = file.md5 + ext;
      const allowedType = [".png", ".jpg", ".jpeg"];

      if (!allowedType.includes(ext.toLowerCase()))
        return res.status(422).json({
          code: "422",
          status: "Not Found",
          message: "Invalid Images",
        });
      if (fileSize > 5000000)
        return res.status(422).json({
          code: "422",
          status: "Not Found",
          message: "Image must be less than 5 MB",
        });

      const filepath = `./public/images/${product.image}`;
      fs.unlinkSync(filepath);

      file.mv(`./public/images/${fileName}`, (err) => {
        if (err) return res.status(500).json({ msg: err.message });
      });
    }
    // const name = req.body.title;
    const { name, hbeli, hjual } = req.body;
    const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
    // Validasi field name, stock, harga_beli, dan harga_jual
    const error = {};

    if (!name) {
      error.name = "Nama produk harus diisi";
    } else if (name.length < 3) {
      error.name = "Nama produk terlalu pendek";
    }
    if (!hbeli || hbeli <= 0) {
      error.hbeli = "Harga beli produk harus diisi dengan angka lebih dari 0";
    }
    if (!hjual || hjual <= 0) {
      error.hjual = "Harga jual produk harus diisi dengan angka lebih dari 0";
    } else if (hjual <= hbeli) {
      error.hjual = "Harga jual produk harus lebih tinggi daripada harga beli";
    }
    // Jika terdapat error validasi, kirim respons error
    if (Object.keys(error).length > 0) {
      return res.status(422).json({
        code: "422",
        status: "Bad Request",
        errors: error,
      });
    }

    await Product.update(
      { name: name, hbeli: hbeli, hjual: hjual, image: fileName, url: url },
      {
        where: {
          id: req.params.id,
        },
      }
    );
    res.status(200).json({
      code: "200",
      status: "Ok",
      messege: "Product Updated Successfuly",
    });
  } catch (error) {
    res.status(500).json({
      code: "500",
      status: "Internal Server Erro",
      message: "Terjadi kesalahan pada server",
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!product)
      return res.status(404).json({
        code: "404",
        status: "Not Found",
        message: "No Data Found",
      });

    const filepath = `./public/images/${product.image}`;
    fs.unlinkSync(filepath);
    await Product.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({
      code: "200",
      status: "Ok",
      messege: "Product Deleted Successfuly",
    });
  } catch (error) {
    res.status(500).json({
      code: "500",
      status: "Internal Server Erro",
      message: "Terjadi kesalahan pada server",
    });
  }
};
