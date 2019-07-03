const helmet =  require('helmet');
const compression =  require('compression');

module.export =function(app){
    app.use(helmet());
    app.use(compression());
}