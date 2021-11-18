import React, { Component, useState, useMemo, useRef } from 'react';

import ApiService from '../../services/ApiService';
import { toast } from 'react-toastify';
import MaterialTable from 'material-table';
import IntentParamReferenceTypes from './IntentParamReferenceTypes';
import IntentReferenceTypes from './IntentReferenceTypes';
import MessageIcon from '@material-ui/icons/MailOutline';
import CancelIcon from '@material-ui/icons/Close';
import InfoIcon from '@material-ui/icons/Info'
import { withStyles } from '@material-ui/styles';
import {
    Grid,
    Typography,
    Button,
    Card,
    Dialog,
    DialogTitle,
    TextField,
    DialogContent,
    DialogContentText,
    DialogActions,
} from '@material-ui/core';
import Loader from '../../common/Loader';
import Languages from '../Train/Languages';

let ty = "";

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

const WAIT_INTERVAL = 1000;
class Intent extends React.Component {

    constructor(props) {

        super(props);
        this.state = {

            intent_name: "",
            intent_code: "",
            application: "",
            parameter_code: "",
            parameter_name: "",
            type: "",
            options: "",
            intent_id: "",
            intent_message: "",
            intent_param_message: "",
            parameter_id: "",
            order : "",
            tableData: [],
            tableMessageData: [],
            paramTypes: [],
            load: false,
            applicationId: localStorage.getItem('applicationId'),
            applicationName: localStorage.getItem('applicationName'),
            dialogOpen: false,
            dialogOpenMessage: false,
            selectedIntentId: "",
            selectedIntentParamId: "",
            selectedTitleName: "",
            selectedType: "",
            message_text: "",
            explanation: "",
            referenceTypeId: "",
            selectedReferenceId: "",
            message_id: ""
        };
        this.apiService = new ApiService();
        this.onSelectParam = this.onSelectParam.bind(this);
        this.onSelectLanguage = this.onSelectLanguage.bind(this);
    }


    async getIntents() {

        this.setState({ load: true });

        let response = await this.apiService.getIntendAllData();

        if (response.data.isSucceed) {
            this.setState({
                tableData: response.data.result.sort(function (a, b) {
                    return b.id.localeCompare(a.id);
                }),
                load: false
            });

        }

    }


    async getMessageSentByReferenceId(ReferenceId, ReferenceType, TitleName) {

        this.setState({
            load: true,
            dialogOpen: true,
            selectedTitleName: TitleName,
            selectedType: ReferenceType,
            selectedReferenceId: ReferenceId
        });

        let response = await this.apiService.getMessageSentByReferenceId(ReferenceId, ReferenceType);
        if (response.status === 200) {
            this.setState({
                tableMessageData: response.data,
                load: false
            })
        }
    }


    async addIntent(intentName, turkishIntendName) {

        this.setState({ load: true });

        let response = await this.apiService.createIntent(this.state.applicationId, intentName, turkishIntendName);

        if (response.status === 200) {

            toast.success('Başarı ile eklendi.', {
                position: toast.POSITION.TOP_CENTER,
                hideProgressBar: true
            });
            this.setState({ load: false });
            this.getIntents();

        } else {

            toast.error('Ekleme sırasında hata oluştu. Tekrar deneyiniz.', {
                position: toast.POSITION.TOP_CENTER,
                hideProgressBar: true
            });
            this.setState({ load: false });
        }
    }

    async editIntent(id, intentName, turkishIntentName) {

        this.setState({ load: true });

        let response = await this.apiService.editIntent(id, this.state.applicationId, intentName, turkishIntentName);

        if (response.status === 200) {

            toast.success('Başarı ile güncellendi.', {
                position: toast.POSITION.TOP_CENTER,
                hideProgressBar: true
            });
            this.getIntents();
            this.setState({ load: false });
        } else {

            toast.error('Güncelleme sırasında hata oluştu. Tekrar deneyiniz.', {
                position: toast.POSITION.TOP_CENTER,
                hideProgressBar: true
            });
            this.setState({ load: false });
        }
    }

    async deleteIntent(id) {

        this.setState({ load: true });

        let response = await this.apiService.deleteIntent(id);

        if (response != null) {

            toast.success('Kayıt silindi.', {
                position: toast.POSITION.TOP_CENTER,
                hideProgressBar: true
            });
            this.getIntents();
            this.setState({ load: false });
        } else {

            toast.error('Kayıt silinirken hata oluştu. Lütfen tekrar deneyiniz', {
                position: toast.POSITION.TOP_CENTER,
                hideProgressBar: true
            });
            this.setState({ load: false });
        }
    };

    async getParameterTypes() {

        this.setState({ load: true });

        this.apiService.getIntentParameterTypes()
            .then((response) => {

                this.state.paramTypes = response.data.result;
                this.setState({ load: false });
            })
            .catch((error) => {

            });
    }

    async addIntentParam(intentId, parameterName, turkishParameterName, type, order, options) {

        this.setState({ load: true });


        let response = await this.apiService.createIntentParam(intentId, parameterName, turkishParameterName, "true", type, order, options);


        if (response.status === 200) {

            toast.success('Başarı ile eklendi.', {
                position: toast.POSITION.TOP_CENTER,
                hideProgressBar: true
            });

            ty = "";

            this.setState({ load: false });
            this.getIntents();

        } else {

            toast.error('Ekleme sırasında hata oluştu. Tekrar deneyiniz.', {
                position: toast.POSITION.TOP_CENTER,
                hideProgressBar: true
            });
            this.setState({ load: false });
        }
    }

    async editIntentParam(id, intentId, parameterName, turkishParameterName, type, order, options) {

        this.setState({ load: true });

        let response = await this.apiService.editIntentParam(id, intentId, parameterName, turkishParameterName, type, order, options);

        if (response.status === 200) {

            toast.success('Başarı ile güncellendi.', {
                position: toast.POSITION.TOP_CENTER,
                hideProgressBar: true
            });
            this.getIntents();
            this.setState({ load: false });
        } else {

            toast.error('Güncelleme sırasında hata oluştu. Tekrar deneyiniz.', {
                position: toast.POSITION.TOP_CENTER,
                hideProgressBar: true
            });
            this.setState({ load: false });
        }
    }
    async deleteIntentParam(id) {

        this.setState({ load: true });

        let response = await this.apiService.deleteIntentParam(id);

        if (response.status == 200) {

            toast.success('Kayıt silindi.', {
                position: toast.POSITION.TOP_CENTER,
                hideProgressBar: true
            });
            this.getIntents();
            this.setState({ load: false });
        } else {

            toast.error('Kayıt silinirken hata oluştu. Lütfen tekrar deneyiniz', {
                position: toast.POSITION.TOP_CENTER,
                hideProgressBar: true
            });
            this.setState({ load: false });
        }
    };


    async addMessage(ReferenceId, ReferenceTypeId, TextSent, Explanation) {

        this.setState({ load: true });


        let response = await this.apiService.createMessage(ReferenceId, ReferenceTypeId, TextSent, Explanation);

        if (response.status === 200) {

            toast.success('Başarı ile eklendi.', {
                position: toast.POSITION.TOP_CENTER,
                hideProgressBar: true
            });
            this.setState({ load: false });
            this.getMessageSentByReferenceId(this.state.selectedReferenceId, this.state.selectedType, this.state.selectedTitleName);

        } else {
            toast.error('Ekleme sırasında hata oluştu. Tekrar deneyiniz.', {
                position: toast.POSITION.TOP_CENTER,
                hideProgressBar: true
            });
            this.setState({ load: false });
        }
    }

    async editMessage(id, ReferenceId, ReferenceTypeId, TextSent, Explanation) {

        this.setState({ load: true });

        let response = await this.apiService.editMessage(id, ReferenceId, ReferenceTypeId, TextSent, Explanation);

        if (response.status === 200) {

            toast.success('Başarı ile güncellendi.', {
                position: toast.POSITION.TOP_CENTER,
                hideProgressBar: true
            });
            this.getMessageSentByReferenceId(this.state.selectedReferenceId, this.state.selectedType, this.state.selectedTitleName);
            this.setState({ load: false });
        } else {

            toast.error('Güncelleme sırasında hata oluştu. Tekrar deneyiniz.', {
                position: toast.POSITION.TOP_CENTER,
                hideProgressBar: true
            });
            this.setState({ load: false });
        }
    }


    async deleteMessage(id) {

        this.setState({ load: true });

        let response = await this.apiService.deleteMessage(id);

        if (response.status == 200) {

            toast.success('Kayıt silindi.', {
                position: toast.POSITION.TOP_CENTER,
                hideProgressBar: true
            });
            this.getMessageSentByReferenceId(this.state.selectedReferenceId, this.state.selectedType, this.state.selectedTitleName);
            this.setState({ load: false });
        } else {

            toast.error('Kayıt silinirken hata oluştu. Lütfen tekrar deneyiniz', {
                position: toast.POSITION.TOP_CENTER,
                hideProgressBar: true
            });
            this.setState({ load: false });
        }
    };

    handleChange = (e) => {
        this.state.intent_code = e.target.value;
    };

    onSelectParam = (event) => {

        ty = event.target.value;
        this.onSetType(ty);

        this.setState({

            intent_id: ""
        });

        /*this.setState({

            type: event.target.value
        });*/
    }

    onSelectLanguage(event) {
        this.setState({

            language: event.value
        });
    }


    onSetType = (typ) => {



        this.state.type = typ

    }

    onConditionEditorClose = () => {
        this.setState({ dialogOpen: false });
    };

    onConditionEditorMessageClose = () => {
        this.setState({ dialogOpenMessage: false });
    };

    componentDidMount() {

        this.getIntents();
        this.getParameterTypes();
        //this.timer = null;
    }


    render() {


        const { classes } = this.props;

        const { type } = this.state;
        var text = "{TEXT}";

        let tempMainTableData = [];
        let tempMainTableMessageData = [];

        tempMainTableMessageData = this.state.tableMessageData.map((parameter) => {
            let IntentTypes = [];

            IntentTypes = IntentReferenceTypes.concat(IntentParamReferenceTypes);
            return {
                message_text: parameter.textSent,
                explanation: parameter.explanation,
                referenceTypeId: parameter.referenceTypeId,
                message_id: parameter.id
            };
        });


        tempMainTableData = this.state.tableData.map((parameter) => {
            return {
                intent_code: parameter.intendName,
                intent_name: parameter.turkishIntendName,
                application: this.state.applicationName,
                date_added: parameter.createTime,
                parameters: parameter.parameterList,
                intent_id: parameter.id,
                //intent_message: parameter.intentMessage

            };
        });

        const clientOptions = {};
        this.state.paramTypes.map((paramType) => {
            //const { id, typeName} = paramType;
            clientOptions[paramType.typeName] = paramType.typeName
        })


        const isOpt = {};
        this.state.paramTypes.map((paramType) => {
            isOpt[paramType.typeName] = paramType.isOption
        })


        const languageOptions = {};
        Languages.map((lang) => {
            languageOptions[lang.code] = lang.code
        })

        const referenceIdOptions = {};
        if (this.state.selectedType == 1) {
            IntentReferenceTypes.map((intent) => {
                referenceIdOptions[intent.code] = intent.value
            })
        } else {
            IntentParamReferenceTypes.map((intentParam) => {
                referenceIdOptions[intentParam.code] = intentParam.value
            })
        }

        return (

            <div className={classes.root}>
                <Grid item lg={12} md={12} xl={12} xs={12}>
                    <Card>
                        <MaterialTable

                            tableRef={this.tableRef}

                            title=""

                            columns={[
                                {
                                    title: 'NİYET ADI',
                                    field: 'intent_name',

                                },
                                {
                                    title: 'NİYET KODU',
                                    field: 'intent_code',
                                    editable: "onAdd"
                                },
                                {
                                    title: 'UYGULAMA',
                                    field: 'application',
                                    editComponent: t => {

                                        return this.state.applicationName;
                                    }
                                }
                            ]}


                            data={tempMainTableData}

                            actions={[
                                rowData => ({
                                    icon: () => <MessageIcon />,
                                    onClick: (event, rowData) => this.getMessageSentByReferenceId(rowData.intent_id, 1, rowData.intent_name)

                                })
                            ]}

                            editable={{
                                onRowAdd: (newData) =>
                                    new Promise((resolve, reject) => {
                                        setTimeout(() => {
                                            {
                                                this.setState({

                                                    intent_name: newData.intent_name,
                                                    intent_code: newData.intent_code
                                                });


                                                if (this.state.intent_code == null && this.state.intent_name == null) {

                                                    toast.error('Niyet Kodu ve Niyet Adı alanları boş bırakılamaz!', {
                                                        position: toast.POSITION.TOP_CENTER,
                                                        hideProgressBar: true
                                                    });

                                                } else if (this.state.intent_code == null) {

                                                    toast.error('Niyet Kodu alanı boş bırakılamaz!', {
                                                        position: toast.POSITION.TOP_CENTER,
                                                        hideProgressBar: true
                                                    });

                                                } else if (this.state.intent_name == null) {
                                                    toast.error('Niyet Adı alanı boş bırakılamaz!', {
                                                        position: toast.POSITION.TOP_CENTER,
                                                        hideProgressBar: true
                                                    });

                                                } else {

                                                    this.addIntent(this.state.intent_code, this.state.intent_name);
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

                                                    intent_name: newData.intent_name,
                                                    intent_id: oldData.intent_id,
                                                    intent_code: oldData.intent_code
                                                });

                                                if (newData.intent_name != "") {
                                                    this.editIntent(this.state.intent_id, this.state.intent_code, this.state.intent_name);
                                                } else {
                                                    toast.error('Niyet Adı alanı boş bırakılamaz!', {
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
                                                    intent_id: oldData.intent_id,
                                                });
                                                this.deleteIntent(oldData.intent_id);
                                                /*let data = tempTableDatas;
                                                const index = data.indexOf(oldData);
                                                data.splice(index, 1);
                                                this.setState({ tableDatas: data }, () => resolve());*/
                                                this.setState(() => resolve());

                                            }
                                            resolve();
                                        }, 1000);
                                    }),
                            }}


                            detailPanel={[
                                rowData => ({

                                    render: (rowData) => {


                                        return (

                                            <MaterialTable
                                                title="PARAMETRELER"
                                                columns={[
                                                    {
                                                        title: 'Parametre Adı',
                                                        field: 'parameter_name'
                                                    },
                                                    {
                                                        title: 'Parametre Kodu',
                                                        field: 'parameter_code'
                                                    },
                                                    {
                                                        title: 'Parametre Tipi',
                                                        field: 'type',
                                                        lookup: { ...clientOptions },


                                                    },
                                                    {
                                                        title: 'Seçenekler',
                                                        field: 'options',
                                                    },
                                                    {
                                                        title: 'Sıra',
                                                        field: 'order',
                                                    }
                                                ]}

                                                data={

                                                    rowData.parameters.map((parameter) => {
                                                        return {

                                                            parameter_code: parameter.parameterName,
                                                            parameter_name: parameter.turkishParameterName,
                                                            type: parameter.type,
                                                            options: parameter.options,
                                                            parameter_id: parameter.id,
                                                            intent_param_message: parameter.intentParamMessage,
                                                            order : parameter.order
                                                        };
                                                    })
                                                }


                                                editable={{
                                                    onRowAdd: (newData) =>
                                                        new Promise((resolve, reject) => {
                                                            setTimeout(() => {
                                                                {
                                                                    this.setState({

                                                                        parameter_code: newData.parameter_code,
                                                                        parameter_name: newData.parameter_name,
                                                                        intent_id: rowData.intent_id,
                                                                        type: newData.type,
                                                                        order: "1",
                                                                        options: newData.options,
                                                                        order : newData.order
                                                                    });


                                                                    if (this.state.parameter_code == null && this.state.parameter_name == null) {

                                                                        toast.error('Parametre Adı ve Parametre Kodu boş bırakılamaz!', {
                                                                            position: toast.POSITION.TOP_CENTER,
                                                                            hideProgressBar: true
                                                                        });
                                                                    } else if (this.state.parameter_code == null) {
                                                                        toast.error('Parametre Kodu boş bırakılamaz!', {
                                                                            position: toast.POSITION.TOP_CENTER,
                                                                            hideProgressBar: true
                                                                        });
                                                                    }else if(this.state.order == null){
                                                                        toast.error('Sıra alanı boş bırakılamaz!', {
                                                                            position: toast.POSITION.TOP_CENTER,
                                                                            hideProgressBar: true
                                                                        });
                                                                    
                                                                    } else if (this.state.parameter_name == null) {
                                                                        toast.error('Parametre Adı boş bırakılamaz!', {
                                                                            position: toast.POSITION.TOP_CENTER,
                                                                            hideProgressBar: true
                                                                        });
                                                                    } else {

                                                                        if (this.state.type != null) {

                                                                            if (isOpt[this.state.type]) {

                                                                                if (this.state.options == null || this.state.options == "") {

                                                                                    toast.error('Bu Parametre Tipi için Seçenekler boş bırakılamaz!', {
                                                                                        position: toast.POSITION.TOP_CENTER,
                                                                                        hideProgressBar: true
                                                                                    });
                                                                                } else {
                                                                                    this.addIntentParam(this.state.intent_id, this.state.parameter_code, this.state.parameter_name,
                                                                                        this.state.type, this.state.order, this.state.options);

                                                                                }
                                                                            } else {

                                                                                if (this.state.options != null) {

                                                                                    toast.error('Bu Parametre Tipi için Seçenek girilemez!', {
                                                                                        position: toast.POSITION.TOP_CENTER,
                                                                                        hideProgressBar: true
                                                                                    });
                                                                                } else {

                                                                                    this.addIntentParam(this.state.intent_id, this.state.parameter_code, this.state.parameter_name,
                                                                                        this.state.type, this.state.order, this.state.options);

                                                                                }


                                                                            }

                                                                        } else {

                                                                            if (this.state.options != null) {

                                                                                toast.error('Parametre Tipi boşken Seçenek girilemez!', {
                                                                                    position: toast.POSITION.TOP_CENTER,
                                                                                    hideProgressBar: true
                                                                                });
                                                                            } else {
                                                                                this.addIntentParam(this.state.intent_id, this.state.parameter_code, this.state.parameter_name,
                                                                                    this.state.type, this.state.order, this.state.options);

                                                                            }


                                                                        }

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

                                                                        parameter_code: newData.parameter_code,
                                                                        parameter_name: newData.parameter_name,
                                                                        parameter_id: oldData.parameter_id,
                                                                        type: newData.type,
                                                                        intent_id: rowData.intent_id,
                                                                        order: newData.order,
                                                                        options: newData.options,
                                                                        intent_param_message: newData.intent_param_message


                                                                    });

                                                                    if (newData.parameter_name == "" && newData.parameter_code == "") {

                                                                        toast.error('Parametre Adı ve Parametre Kodu boş bırakılamaz!', {
                                                                            position: toast.POSITION.TOP_CENTER,
                                                                            hideProgressBar: true
                                                                        });

                                                                    } else if (newData.parameter_name == "") {

                                                                        toast.error('Parametre Adı boş bırakılamaz!', {
                                                                            position: toast.POSITION.TOP_CENTER,
                                                                            hideProgressBar: true
                                                                        });
                                                                    }else if(newData.order == null || newData.order == ""){
                                                                        toast.error('Sıra alanı boş bırakılamaz!', {
                                                                            position: toast.POSITION.TOP_CENTER,
                                                                            hideProgressBar: true
                                                                        });
                                                                    } else if (newData.parameter_code == "") {

                                                                        toast.error('Parametre Kodu boş bırakılamaz!', {
                                                                            position: toast.POSITION.TOP_CENTER,
                                                                            hideProgressBar: true
                                                                        });
                                                                    } else {

                                                                        if (isOpt[newData.type]) {

                                                                            if (newData.options == null || newData.options == "") {

                                                                                toast.error('Bu Parametre Tipi için Seçenekler boş bırakılamaz!', {
                                                                                    position: toast.POSITION.TOP_CENTER,
                                                                                    hideProgressBar: true
                                                                                });
                                                                            } else {
                                                                                this.editIntentParam(this.state.parameter_id, this.state.intent_id, this.state.parameter_code,
                                                                                    this.state.parameter_name, this.state.type, this.state.order, this.state.options);

                                                                            }
                                                                        } else {

                                                                            if (newData.options == "" || newData.options == null) {

                                                                                this.editIntentParam(this.state.parameter_id, this.state.intent_id, this.state.parameter_code,
                                                                                    this.state.parameter_name, this.state.type, this.state.order, this.state.options);

                                                                            }
                                                                            else {

                                                                                toast.error('Bu Parametre Tipi için Seçenek girilemez!', {
                                                                                    position: toast.POSITION.TOP_CENTER,
                                                                                    hideProgressBar: true
                                                                                });

                                                                            }


                                                                        }



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
                                                                        parameter_id: oldData.parameter_id,
                                                                    });
                                                                    this.deleteIntentParam(oldData.parameter_id);
                                                                    /*let data = tempTableDatas;
                                                                    const index = data.indexOf(oldData);
                                                                    data.splice(index, 1);
                                                                    this.setState({ tableDatas: data }, () => resolve());*/
                                                                    this.setState(() => resolve());

                                                                }
                                                                resolve();
                                                            }, 1000);
                                                        }),
                                                }}

                                                actions={[
                                                    rowData => ({
                                                        icon: () => <MessageIcon />,
                                                        onClick: (event, rowData) => this.getMessageSentByReferenceId(rowData.parameter_id, 2, rowData.parameter_name)
                                                    })
                                                ]}

                                                options={{
                                                    addRowPosition: 'first',
                                                    selection: false,
                                                    search: false,
                                                    paging: false,
                                                    actionsColumnIndex: -1,
                                                    rowStyle: {
                                                        backgroundColor: '#EEE',
                                                    },
                                                    headerStyle: {
                                                        backgroundColor: '#EEE',

                                                    }

                                                }}

                                                localization={{
                                                    body: {
                                                        emptyDataSourceMessage: 'Gösterilecek kayıt yok.',
                                                        editRow: {
                                                            deleteText: 'Parametre silinecektir, kaydı silmek istediğinize emin misiniz?',
                                                            saveTooltip: 'Kaydet',
                                                            cancelTooltip: 'İptal',
                                                        },
                                                        editTooltip: 'Parametre Düzenle',
                                                        deleteTooltip: 'Parametre Sil',
                                                        addTooltip: 'Parametre Ekle',
                                                    },
                                                    toolbar: {

                                                        searchTooltip: 'Arama',
                                                        searchPlaceholder: 'Arama',
                                                    },
                                                    header: {

                                                        actions: 'SEÇİMLER',
                                                    }
                                                }}

                                            />
                                        );
                                    },
                                }),
                            ]}




                            onRowClick={(event, rowData, togglePanel) => togglePanel()}

                            options={{
                                addRowPosition: 'first',
                                selection: false,
                                pageSize: 10,
                                actionsColumnIndex: -1,
                            }}



                            localization={{
                                body: {

                                    emptyDataSourceMessage: 'Gösterilecek kayıt yok.',
                                    editRow: {
                                        deleteText: 'Intent , intent parametreleri ve mesajları silinecektir. Kaydı silmek istediğinize emin misiniz?',
                                        saveTooltip: 'Kaydet',
                                        cancelTooltip: 'İptal',
                                    },
                                    editTooltip: 'Değiştir',
                                    deleteTooltip: 'Sil',
                                    addTooltip: 'Ekle'
                                },
                                toolbar: {

                                    searchTooltip: 'Arama',
                                    searchPlaceholder: 'Arama',
                                },
                                header: {

                                    actions: 'SEÇİMLER',
                                },
                                pagination: {

                                    labelRowsSelect: 'satır',
                                    labelDisplayedRows: '{count} satırdan {from}-{to} arası',
                                    firstTooltip: 'İlk Sayfa',
                                    previousTooltip: 'Önceki Sayfa',
                                    nextTooltip: 'Sonraki Sayfa',
                                    lastTooltip: 'Son Sayfa',
                                }
                            }}

                        />

                        <Dialog
                            open={this.state.dialogOpen}
                            aria-labelledby="draggable-dialog-title"
                        >
                            <DialogTitle id="draggable-dialog-title">
                                {this.state.selectedTitleName} {this.state.selectedType == 1 ? 'Intent' : 'Intent Parametre'} Mesajları
                                <Button onClick={this.onConditionEditorClose} style={{ float: 'right', marginTop: '-15px' }}>
                                    <CancelIcon className={classes.icon} fontSize="large" style={{ fill: '#3F51B5' }} />
                                </Button>
                            </DialogTitle>

                            <DialogContent>
                                <MaterialTable

                                    tableRef={this.tableRef}

                                    title=""

                                    columns={[
                                        {
                                            title: 'Mesaj',
                                            field: 'message_text',
                                        },
                                        {
                                            title: 'DİL',
                                            field: 'explanation',
                                            width: "40%",
                                            lookup: { ...languageOptions }
                                        },
                                        {
                                            title: 'Mesaj Tipi',
                                            field: 'referenceTypeId',
                                            width: "40%",
                                            lookup: { ...referenceIdOptions }
                                        }
                                    ]}


                                    data={tempMainTableMessageData}

                                    actions={[
                                        {
                                            icon: () => <InfoIcon />,
                                            onClick: (e, data) => this.setState({ dialogOpenMessage: true }),
                                            isFreeAction: true,
                                            tooltip: "Mesaj Tip Bilgisi"
                                        }
                                    ]}


                                    editable={{
                                        onRowAdd: (newData) =>
                                            new Promise((resolve, reject) => {
                                                setTimeout(() => {
                                                    {
                                                        this.setState({
                                                            message_text: newData.message_text,
                                                            explanation: newData.explanation,
                                                            referenceTypeId: newData.referenceTypeId,
                                                        });

                                                        if (this.state.message_text == null) {

                                                            toast.error('Mesaj alanı boş bırakılamaz!', {
                                                                position: toast.POSITION.TOP_CENTER,
                                                                hideProgressBar: true
                                                            });

                                                        } else if (this.state.explanation == null) {

                                                            toast.error('Dil alanı boş bırakılamaz!', {
                                                                position: toast.POSITION.TOP_CENTER,
                                                                hideProgressBar: true
                                                            });

                                                        } else if (this.state.referenceTypeId == null) {
                                                            toast.error('Mesaj Tip No alanı boş bırakılamaz!', {
                                                                position: toast.POSITION.TOP_CENTER,
                                                                hideProgressBar: true
                                                            });

                                                        } else {

                                                            this.addMessage(this.state.selectedReferenceId, this.state.referenceTypeId, this.state.message_text, this.state.explanation);
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
                                                            message_text: newData.message_text,
                                                            explanation: newData.explanation,
                                                            referenceTypeId: newData.referenceTypeId
                                                        });

                                                        if (this.state.message_text == null) {

                                                            toast.error('Mesaj alanı boş bırakılamaz!', {
                                                                position: toast.POSITION.TOP_CENTER,
                                                                hideProgressBar: true
                                                            });

                                                        } else if (this.state.explanation == null) {

                                                            toast.error('Dil alanı boş bırakılamaz!', {
                                                                position: toast.POSITION.TOP_CENTER,
                                                                hideProgressBar: true
                                                            });

                                                        } else if (this.state.referenceTypeId == null) {
                                                            toast.error('Mesaj Tip No alanı boş bırakılamaz!', {
                                                                position: toast.POSITION.TOP_CENTER,
                                                                hideProgressBar: true
                                                            });

                                                        } else {

                                                            this.editMessage(oldData.message_id, this.state.selectedReferenceId, this.state.referenceTypeId, this.state.message_text, this.state.explanation)
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
                                                            message_id: oldData.message_id,
                                                        });
                                                        this.deleteMessage(oldData.message_id);
                                                        this.setState(() => resolve());

                                                    }
                                                    resolve();
                                                }, 1000);
                                            }),
                                    }}


                                    options={{
                                        addRowPosition: 'first',
                                        selection: false,
                                        pageSize: 8,
                                        actionsColumnIndex: -1,
                                        search: false
                                    }}



                                    localization={{
                                        body: {

                                            emptyDataSourceMessage: 'Gösterilecek kayıt yok.',
                                            editRow: {
                                                deleteText: 'Mesaj silinecektir, kaydı silmek istediğinize emin misiniz?',
                                                saveTooltip: 'Kaydet',
                                                cancelTooltip: 'İptal',
                                            },
                                            editTooltip: 'Değiştir',
                                            deleteTooltip: 'Sil',
                                            addTooltip: 'Ekle'
                                        },
                                        toolbar: {

                                            searchTooltip: 'Arama',
                                            searchPlaceholder: 'Arama',
                                        },
                                        header: {

                                            actions: 'SEÇİMLER',
                                        },
                                        pagination: {

                                            labelRowsSelect: 'satır',
                                            labelDisplayedRows: '{count} satırdan {from}-{to} arası',
                                            firstTooltip: 'İlk Sayfa',
                                            previousTooltip: 'Önceki Sayfa',
                                            nextTooltip: 'Sonraki Sayfa',
                                            lastTooltip: 'Son Sayfa',
                                        }
                                    }}

                                />
                            </DialogContent>
                        </Dialog>

                        <Dialog
                            open={this.state.dialogOpenMessage}
                            aria-labelledby="draggable-dialog-title">
                            <DialogTitle>
                                MESAJ TİPi BİLGİLERİ
                                <Button onClick={this.onConditionEditorMessageClose} style={{ float: 'right', marginTop: '-15px' }}>
                                    <CancelIcon className={classes.icon} fontSize="large" style={{ fill: '#3F51B5' }} />
                                </Button>
                            </DialogTitle>
                            <DialogContent>
                                <DialogContentText  style={{ fontSize:'15px'}} >
                                    <b style={{color:'#3f51b5' }}>Intent Yanıtı:</b> Intent'e tanımlandığında yanıt olarak dönen mesajdır.
                                </DialogContentText>
                                <DialogContentText style={{ fontSize:'15px'}} >
                                    <b style={{color:'#3f51b5' }}>Intent Başarısız Mesajı: </b> Intent başarısız sonuçlandığında bilgi veren mesajdır. Örn: <b>"Bilgilerinize ulaşılamamıştır.İşlem gerçekleştirilemedi."</b>
                                </DialogContentText>
                                <DialogContentText style={{ fontSize:'15px'}} >
                                    <b style={{color:'#3f51b5' }}>Parametre Sorusu Mesajı: </b> Parametreye tanımlanan sorunun mesajıdır.
                                </DialogContentText>
                                <DialogContentText style={{ fontSize:'15px'}} >
                                    <b style={{color:'#3f51b5' }}>Retry Mesajı: </b> Parametreye tanımlanan tekrar mesajlarıdır. Örn: <b>"Lütfen doğru formatta giriniz"</b>
                                </DialogContentText>
                                <DialogContentText style={{ fontSize:'15px'}} >
                                    <b style={{ color:'#3f51b5' }}>Parametre Değiştirme Mesajı: </b> Parametre mesajı içerisinde yer alan alanların ilgili değerler ile değiştirilmesi sağlanır. Örn: <b>"Plakanızı {text} olarak anlıyorum. </b>
                                </DialogContentText>
                            </DialogContent>
                        </Dialog>
                        <Grid container spacing={16}>
                        </Grid>
                    </Card>
                    {this.state.load && <Loader />}
                </Grid>
            </div>

        );
    }
}

//export default withStyles(styles)(Intent);

export default withStyles(styles)(Intent);

