function handleError(err, res){
  console.log(err)
  if (err.name === 'SequelizeValidationError'|| err.name === 'SequelizeUniqueConstraintError'){
    const errObj = {};
    err.errors.map( er => {
      errObj[er.path] = er.message;
    })
    res.status(400).send(errObj);
  }
  else {
    res.status(400).send({
      message:
        err.message || "Some error occurred while creating course."
    });
  }
}

module.exports = handleError
