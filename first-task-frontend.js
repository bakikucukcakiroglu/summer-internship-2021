import React, { Component, useState, useMemo } from 'react';
import Languages from './Languages';
import Intentions from './Intentions';
//import SelectSearch from 'react-select-search';
//import Dropdown from 'react-mui-multiselect-dropdown'

import Select from 'react-select';
import ExcelAltIcon from '../../images/excelimport.png';

import ApiService from '../../services/ApiService';
import { toast } from 'react-toastify';
import './tt.css';
import MaterialTable from 'material-table';
import { withStyles } from '@material-ui/styles';
import {
    Grid,
    Typography,
    Card,
    CardContent,
    //Select,
    Divider,
    Button
} from '@material-ui/core';
import Loader from '../../common/Loader';
import { Row } from 'react-bootstrap';


const styles = (theme) => ({

    root: {

        flexGrow: 2,
        padding: '10px',
        textAlign: 'center',
    },
    button: {

        flexGrow: 2,
        align: "left"
    },
    typography: {

        flexGrow: 1,
        textAlign: 'left'
    },
    formTop: {

        paddingTop: '17px',
    },
    dialogPaper: {

        minHeight: '30vh',
        maxHeight: '50vh',
    },
    palette: {

        primary: '#ff1744',
        secondary: '#2196f3',
    },
    color: {

        color: '#FF935C',
    },
    formControl: {

        marginTop: theme.spacing(2),
        minWidth: 550,
    },
    formControlLabel: {

        marginTop: theme.spacing(1),
    }
});

let tempTable = [];

class Train extends React.Component {

    constructor(props) {

        super(props);
        this.state = {

            language: "TR",
            sentence: '',
            id: "",
            intentionName: "null",
            intentionNames: [],
            applicationId: localStorage.getItem('applicationId'),
            selectedRow: [],
            tableDatas: [],
            load: false,
            isDialogIntent: false
        };
        this.apiService = new ApiService();
        this.onSelectLanguage = this.onSelectLanguage.bind(this);
        this.onSelectIntent = this.onSelectIntent.bind(this);
    }

    onSelectIntent(event) {

        if (event != null) {

            if (event.value != "null") {

                this.state.tableDatas = tempTable.filter((data) => (data.intentName === event.value) && (data.language === this.state.language));
                this.setState({

                    intentionName: event.value
                });

                if (this.state.language == "") {

                    this.setState({

                        intentionName: event.value,
                        tableDatas: tempTable
                    });

                    toast.error('L??tfen Dil Se??iniz.', {
                        position: toast.POSITION.TOP_CENTER,
                        hideProgressBar: true
                    });
                }
            } else {

                this.state.tableDatas = tempTable;
                this.setState({

                    intentionName: "null"
                });
            }
        } else {

            toast.error('L??tfen Dil Seniz.', {
                position: toast.POSITION.TOP_CENTER,
                hideProgressBar: true
            });
            this.setState({

                tableDatas: tempTable,
                intentionName: ""

            });
        }
    }

    onSelectLanguage(event) {

        this.setState({

            language: event.value
        });

        if (this.state.intentionName !== "null") {

            this.state.tableDatas = tempTable.filter((data) => (data.language === event.value && data.intentName === this.state.intentionName));
        } else {

            this.state.tableDatas = tempTable.filter((data) => data.language === event.value);
        }
    }


    async getIntentions() {

        this.apiService.getByIntendApplicationId(this.state.applicationId)
            .then((response) => {

                this.setState({

                    intentionNames: response.data,
                });
            })
            .catch((error) => {

                console.log(error)
            });
    }


    async getUtterences() {

        this.setState({ load: true });
        this.apiService.getAllUtterences()
            .then((response) => {
   
                tempTable = response.data;

                this.state.load = false
                if (this.state.intentionName != "null" && this.state.language != "") {
                    this.setState({
                        tableDatas: tempTable.filter((data) => (data.intentName === this.state.intentionName) && (data.language === this.state.language))
                    });
                } else if (this.state.intentionName != "null" && this.state.language == "") {
                    this.setState({
                        tableDatas: tempTable.filter((data) => (data.intentName === this.state.intentionName)),
                    });
                } else if (this.state.intentionName == "null" && this.state.language != "") {

                    this.setState({

                        tableDatas: tempTable.filter((data) => (data.language == this.state.language))
                    })
                } else {

                    this.setState({

                        tableDatas: tempTable
                    })
                }

            })
            .catch((error) => {

                console.log(error)
            });
    }




    componentDidMount() {

        this.getUtterences();
        this.getIntentions();
    }


    getUtterencesImportExcel = () => {
        this.setState({ load: true });
        this.apiService
          .getTrainExcelReport(this.state.intentionName)
          .then((response) => {
            if (response && !response.error) {
              var blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
              saveAs(blob, 'Train Rapor.xlsx');
              this.setState({ load: false });
            }
          });
      };
    async addNewUtterence(sentence, intentName, language) {

        this.setState({ load: true });
        let trainData = {

            ApplicationId: localStorage.getItem('applicationId'),
            IntentName: intentName,
            Text: sentence,
            Language: this.state.language,
        }
        let response = await this.apiService.createNewUtterence(trainData);

        if (response.status === 200) {

            toast.success('Ba??ar?? ile eklendi.', {
                position: toast.POSITION.TOP_CENTER,
                hideProgressBar: true
            });
            this.setState({ load: false });
            this.getUtterences();

        } else {

            toast.error('Ekleme s??ras??nda hata olu??tu. Tekrar deneyiniz.', {
                position: toast.POSITION.TOP_CENTER,
                hideProgressBar: true
            });
            this.setState({ load: false });
        }
    }


    async editNewUtterence(id, intentName, sentence, language) {

        this.setState({ load: true });

        let trainData = {

            Id: id,
            ApplicationId: localStorage.getItem('applicationId'),
            IntentName: intentName,
            Text: sentence,
            Language: language
        }

        let response = await this.apiService.editUtterence(
            trainData
        );

        if (response.status === 200) {

            toast.success('Ba??ar?? ile g??ncellendi.', {
                position: toast.POSITION.TOP_CENTER,
                hideProgressBar: true
            });
            this.getUtterences();
            this.setState({ load: false });
        } else {

            toast.error('G??ncelleme s??ras??nda hata olu??tu. Tekrar deneyiniz.', {
                position: toast.POSITION.TOP_CENTER,
                hideProgressBar: true
            });
            this.setState({ load: false });
        }
    }


    async deleteNewUtterence(id) {

        this.setState({ load: true });

        let response = await this.apiService.deleteUtterence(id);

        if (response != null) {

            toast.success('Kay??t silindi.', {
                position: toast.POSITION.TOP_CENTER,
                hideProgressBar: true
            });
            this.getUtterences();
            this.setState({ load: false });
        } else {

            toast.success('Kay??t silinirken hata olu??tu. L??tfen tekrar deneyiniz', {
                position: toast.POSITION.TOP_CENTER,
                hideProgressBar: true
            });
            this.setState({ load: false });
        }
    };


    trainAllData = () => {

        this.setState({ load: true });
        let response = this.apiService.trainAllData(localStorage.getItem('applicationId'),
            localStorage.getItem('applicationName'), this.state.language)
            .then((response) => {
                if (response.status === 200) {
                    toast.success('Data ba??ar??yla e??itildi.', {
                        position: toast.POSITION.TOP_CENTER,
                        hideProgressBar: true
                    })
                    this.setState({ load: false });
                } else {
                    toast.error('Data e??itilirken hata ile kar????la????ld??.', {
                        position: toast.POSITION.TOP_CENTER,
                        hideProgressBar: true
                    })
                    this.setState({ load: false });
                }
            })
            .catch((error) => {
                console.log(error)
            });
    }


    render() {

        const { classes } = this.props;

        let tempTableDatas = [];
        const dialogsIntent = ["Vedalasma", "SorunBildirimi", "livechat_inin",
            "Selamlama", "Sonlandir", "Kotusoz", "Reddetme", "Onaylama", "SmallTalks", "Diger", "Tesekkur",
            "Kimsin", "vedalasma", "kotusoz", "selamlama", "tesekkur", "diger"];

        tempTableDatas = this.state.tableDatas.map((parameter) => {

            return {

                trainId: parameter.id,
                sentence: parameter.text,
                intentName: this.state.intentionNames.map((parameter2) => {
                    if (parameter2.intendName == parameter.intentName) {

                        return parameter2.turkishIntendName
                    }
                }),
                language:
                    Languages.map((language) => {
                        if (parameter.language == language.code)

                            return language.value
                    })
            };
        });

        let tempIntentionNames = [];
        let tempIntentionNames2 = [];

        let choose = {

            intendName: "null",
            turkishIntendName: "T??m Niyetler"
        };

        tempIntentionNames.push(choose);

        tempIntentionNames2 = this.state.intentionNames.map((parameter) => {
            return {

                intendName: parameter.intendName,
                turkishIntendName: parameter.turkishIntendName
            };
        });

        tempIntentionNames2.sort(function (a, b) {
            return a.turkishIntendName.localeCompare(b.turkishIntendName);
        });

        tempIntentionNames = [choose].concat(tempIntentionNames2);

        const options = tempIntentionNames.map((parameter) => {
            return { value: parameter.intendName, label: parameter.turkishIntendName };
        });

        const options2 = Languages.map((parameter) => {
            return { value: parameter.code, label: parameter.value };
        });

        return (

            <div className={classes.root}>
                <Grid item lg={12} md={12} xl={12} xs={12} >
                    <Card>
                        <CardContent>
                            <Grid container spacing={1}   >
                                <Grid xs={1}>
                                    <Typography
                                        align='left'
                                        className={classes.color}
                                        variant="button"
                                    >
                                        N??YET:
                                    </Typography>
                                </Grid>
                                <Grid xs={2}>

                                    <Select
                                        menuPortalTarget={document.body}
                                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}

                                        value={{
                                            value: this.state.intentionName, label: tempIntentionNames.map((intention) => {
                                                if (intention.intendName == this.state.intentionName) {
                                                    return intention.turkishIntendName
                                                }
                                            })
                                        }}
                                        placeholder="Niyet tipini se??iniz.."
                                        name="form-field-name"
                                        maxMenuHeight={150}
                                        maxMenuWidth={90}
                                        onChange={this.onSelectIntent}
                                        searchable={true}
                                        options={options}
                                    />


                                </Grid>
                                <Grid xs={1}>
                                    <Typography
                                        align='left'
                                        className={classes.color}
                                        variant="button"
                                    >
                                        D??L:
                                    </Typography>
                                </Grid>
                                <Grid xs={2}>
                                    <Select
                                        menuPortalTarget={document.body}
                                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                        value={{
                                            value: this.state.language, label: Languages.map((language) => {
                                                if (language.code == this.state.language) {
                                                    return language.value
                                                }
                                            })
                                        }}
                                        name="form-field-name"
                                        maxMenuHeight={150}
                                        maxMenuWidth={90}
                                        onChange={this.onSelectLanguage}
                                        searchable={true}
                                        options={options2}
                                    />

                                </Grid>
                                <Grid xs={5}>

                                </Grid>
                                <Grid xs={1}>
                                    <Button style={{
                                        backgroundColor: "#3f51b5",
                                        float: 'right',
                                        color: "white",

                                    }}
                                        onClick={() => {
                                            this.trainAllData()
                                        }}>
                                        E????T
                                    </Button>
                                </Grid>
                                <Grid item lg={2} sm={2} xl={2} xs={2}>
                                    <Button style={{ backgroundColor: "#ffff" }}
                                        className={classes.buttonCSV}
                                        onClick={this.getUtterencesImportExcel.bind(this)}>
                                        <img src={ExcelAltIcon} alt="sunil" style={{ width: 35, height: 35 }} />
                                    </Button>
                                </Grid>
                            </Grid>
                        </CardContent>
                        <Divider />
                    </Card>
                </Grid>
                <Grid item lg={12} md={12} xl={12} xs={12} style={{ zIndex: 900 }}>
                    <Card>
                        <MaterialTable
                            tableRef={this.tableRef}
                            title=" "
                            columns={[
                                {
                                    title: 'C??MLE',
                                    field: 'sentence',
                                    width: "30%",
                                },
                                {
                                    title: '??ntent Ad??',
                                    field: 'intentName',
                                    width: "30%",


                                    editComponent: t =>
                                        tempIntentionNames.map((intention) => {
                                            if (intention.intendName == this.state.intentionName) {
                                                if (this.state.intentionName == "null") {

                                                    /*return toast.error('L??tfen ????lem Yapmak ??stedi??iniz Niyet ve Dili Se??iniz.', {
                                                        position: toast.POSITION.TOP_RIGHT,
                                                    });*/

                                                    return <Select
                                                        style={{

                                                            fontSize: '8px',
                                                            width: 20,
                                                            zIndex: 1000
                                                        }}
                                                        value={this.state.language}
                                                        placeholder="Niyet tipini se??iniz.."
                                                        name="form-field-name"
                                                        maxMenuHeight={150}
                                                        maxMenuWidth={90}
                                                        onChange={this.onSelectIntent}
                                                        searchable={true}
                                                        options={options}
                                                    />


                                                } else {

                                                    return intention.turkishIntendName
                                                }
                                            }
                                        })

                                },
                                {
                                    title: 'D??L',
                                    field: 'language',
                                    width: "40%",
                                    editComponent: t => {

                                        if (this.state.language == "") {

                                            return <Select value={this.state.language} onChange={this.onSelectLanguage}>

                                                {Languages.map((language) => <option value={language.code}>{language.value}</option>)}
                                            </Select>

                                            /*return  toast.error('L??tfen ????lem Yapmak ??stedi??iniz Niyet ve Dili Se??iniz.', {
                                                position: toast.POSITION.TOP_RIGHT,
                                            });*/

                                        } else if (this.state.language == "TR") {

                                            return "T??rk??e"
                                        } else if (this.state.language == "EN") {

                                            return "English"
                                        }
                                    }
                                }
                            ]}
                            data={tempTableDatas}

                            options={{

                                addRowPosition: 'first',
                                pageSize: 10,
                                actionsColumnIndex: -1,
                                selection: false
                            }}

                            editable={{
                                isEditable: (row) => this.state.intentionName != 'null' && this.state.language != "",
                                onRowAdd: (newData) =>
                                    new Promise((resolve, reject) => {
                                        setTimeout(() => {
                                            {
                                                this.setState({

                                                    sentence: newData.sentence,
                                                });

                                                let strIntent = this.state.intentionName;
                                                if (dialogsIntent.includes(strIntent)) {
                                                    this.setState({
                                                        isDialogIntent: true,
                                                    });
                                                } else {
                                                    this.setState({
                                                        isDialogIntent: false,
                                                    });
                                                }
                                                

                                                if (this.state.intentionName != "null") {
                                                    if (!this.state.sentence != null) {
                                                        if (this.state.isDialogIntent) {
                                                            toast.error('Bu intent i??in c??mle giri??i yap??lamaz!', {
                                                                position: toast.POSITION.TOP_CENTER,
                                                                hideProgressBar: true
                                                            });
                                                        } else {
                                                            this.addNewUtterence(this.state.sentence, this.state.intentionName, this.state.language);
                                                        }

                                                    } else {
                                                        toast.error('C??mle alan?? bo?? b??rak??lamaz!', {
                                                            position: toast.POSITION.TOP_CENTER,
                                                            hideProgressBar: true
                                                        });
                                                    }
                                                } else {
                                                    toast.error('Niyet alan?? bo?? b??rak??lamaz!', {
                                                        position: toast.POSITION.TOP_CENTER,
                                                        hideProgressBar: true
                                                    });
                                                }



                                                this.setState(() => resolve());
                                            }
                                            resolve();
                                        }, 1000);
                                    }),

                                onRowUpdate: (newData, oldData) =>
                                    new Promise((resolve, reject) => {
                                        setTimeout(() => {
                                            {
                                                this.setState({

                                                    sentence: newData.sentence,

                                                });

                                                let strIntent = this.state.intentionName;
                                                if (dialogsIntent.includes(strIntent)) {
                                                    this.setState({
                                                        isDialogIntent: true,
                                                    });
                                                } else {
                                                    this.setState({
                                                        isDialogIntent: false,
                                                    });
                                                }

                                                if (newData.sentence != "") {
                                                    if (this.state.isDialogIntent) {
                                                        toast.error('Bu intent i??in c??mle alan?? d??zenlenemez!', {
                                                            position: toast.POSITION.TOP_CENTER,
                                                            hideProgressBar: true
                                                        });
                                                    } else {
                                                        this.editNewUtterence(oldData.trainId, this.state.intentionName, this.state.sentence, this.state.language);
                                                    }
                                                } else {
                                                    toast.error('C??mle alan?? bo?? b??rak??lamaz!', {
                                                        position: toast.POSITION.TOP_CENTER,
                                                        hideProgressBar: true
                                                    });
                                                }

                                                this.setState(() => resolve());
                                            }
                                            resolve();
                                        }, 1000);
                                    }),

                                onRowDelete: (oldData) =>
                                    new Promise((resolve, reject) => {
                                        setTimeout(() => {
                                            {
                                                this.setState({
                                                    id: oldData.trainId,
                                                });
                                                this.deleteNewUtterence(oldData.trainId);

                                                this.setState(() => resolve());
                                            }
                                            resolve();
                                        }, 1000);
                                    }),
                            }}

                            localization={{
                                body: {

                                    emptyDataSourceMessage: 'G??sterilecek kay??t yok.',
                                    editRow: {
                                        deleteText: 'Kayd?? silmek istedi??inize emin misiniz?',
                                        saveTooltip: 'Kaydet',
                                        cancelTooltip: '??ptal',
                                    },
                                    editTooltip: 'De??i??tir',
                                    deleteTooltip: 'Sil',
                                    addTooltip: 'Ekle'
                                },
                                toolbar: {

                                    searchTooltip: 'Arama',
                                    searchPlaceholder: 'Arama',
                                },
                                header: {

                                    actions: 'Se??imler',
                                },
                                pagination: {

                                    labelRowsSelect: 'sat??r',
                                    labelDisplayedRows: '{count} sat??rdan {from}-{to} aras??',
                                    firstTooltip: '??lk Sayfa',
                                    previousTooltip: '??nceki Sayfa',
                                    nextTooltip: 'Sonraki Sayfa',
                                    lastTooltip: 'Son Sayfa',
                                }
                            }}
                        />
                        <Grid container spacing={16}>
                        </Grid>
                    </Card>
                    {this.state.load && <Loader />}
                </Grid>
            </div>
        );
    }
}

export default withStyles(styles)(Train);
