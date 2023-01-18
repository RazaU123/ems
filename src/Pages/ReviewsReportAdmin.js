import React, { useEffect, useRef, useState } from "react"
import { connect } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import {
    DownOutlined
} from '@ant-design/icons';
import { Space, Table, Dropdown, Button, Form, Input, Select, Menu, Slider, notification, Popconfirm, DatePicker } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { useMutation, useQuery, useQueryClient } from 'react-query'

import './ReviewsReportAdmin.css'
import TextArea from "antd/lib/input/TextArea";
import moment from "moment";

const { Option } = Select;

function ReviewsReportAdmin(props) {
    const [showAddEditForm, setShowAddEditForm] = useState(false)
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);
    const queryClient = useQueryClient()
    const [errors, setErrors] = useState(null)
    const [api, contextHolder] = notification.useNotification();
    const [selectedManager, setSelectedManager] = useState(null)
    const [selectedSupManager, setSelectedSupManager] = useState(null)
    const [reviewData, setReviewData] = useState([])
    const [filteredData, setFilteredData] = useState([])
    const [filter, setFilter] = useState({
        developer: '',
        startDate: '',
        endDate: '',
        rating: ''
    })
    const params = useParams()

    const openNotification = (type) => {
        let description = type === 'create' ? 'Review created successfully' : 'Review updated successfully'
        api.info({
          message: 'Action Successful',
          description,
          placement: 'topRight',
        });
      };

    const { isLoading: reviewsLoading, data: reviews } = useQuery('reviews', () =>
        fetch('http://localhost:3001/admin/get-reviews', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-access-token': localStorage.getItem('token')
            }
        }).then(res =>
            res.json()
        ), {
            onSuccess: (data) => {
                if(data.data) {
                    setReviewData(data)
                    setFilteredData(data)
                }
            }
        }
    )

    const { isLoading: employeesLoading, data: employeesData } = useQuery('employees', () =>
        fetch('http://localhost:3001/admin/get-employees', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-access-token': localStorage.getItem('token')
            }
        }).then(res =>
            res.json()
        ), {
            onSuccess: () => {
               
            }
        }
    )

    const { isLoading: addReviewLoading, isSuccess: addReviewSuccess, mutate: addReviewMutate } = useMutation('add-review', (data) =>
        fetch('http://localhost:3001/admin/add-review', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-access-token': localStorage.getItem('token')
            },
            body: JSON.stringify(data)
        }).then(res =>
            res.json()
        ), {
        onSuccess: (data, variables, context) => {
            if (data.error) {
                if (data.error?.errors) {
                    let errors = data.error.errors
                    setErrors(errors)
                }
            } else {
                setErrors([])
                openNotification('create')
                setShowAddEditForm(false)
                form.resetFields()
                navigate('/admin/reviews')
                queryClient.invalidateQueries('reviews')
            }
        }
    }
    )

    const { isLoading: editReviewLoading, isSuccess: editReviewSuccess, mutate: editReviewMutate } = useMutation('edit-review', (data) =>
        fetch('http://localhost:3001/admin/update-review/' + data.key, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-access-token': localStorage.getItem('token')
            },
            body: JSON.stringify(data)
        }).then(res =>
            res.json()
        ), {
        onSuccess: (data, variables, context) => {
            if (data.error) {
                if (data.error?.errors) {
                    let errors = data.error.errors
                    setErrors(errors)
                }
            } else {
                setErrors([])
                openNotification('update')
                setShowAddEditForm(false)
                form.resetFields()
                navigate('/admin/reviews')
                queryClient.invalidateQueries('reviews')
            }
        }
    }
    )

    const { isLoading: deleteReviewLoading, isSuccess: deleteReviewSuccess, mutate: deleteReviewMutate } = useMutation('delete-review', (data) =>
        fetch('http://localhost:3001/admin/delete-review/' + data.key, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-access-token': localStorage.getItem('token')
            },
            body: JSON.stringify(data)
        }).then(res =>
            res.json()
        ), {
        onSuccess: (data, variables, context) => {
            setShowAddEditForm(false)
            form.resetFields()
            queryClient.invalidateQueries('reviews')
        }
    }
    )

    const handleSearch = (
        selectedKeys,
        confirm,
        dataIndex,
    ) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText('');
    };

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters)}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Reset
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            confirm({ closeDropdown: false });
                            setSearchText((selectedKeys)[0]);
                            setSearchedColumn(dataIndex);
                        }}
                    >
                        Filter
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            confirm();
                        }}
                    >
                        close
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
        onFilter: (value, record) =>
            record[dataIndex]
                .toString()
                .toLowerCase()
                .includes((value).toLowerCase()),
        onFilterDropdownOpenChange: visible => {
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100);
            }
        },
        render: text =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    });

    const editRecord = (record) => {
        let developer = employeesData?.data?.find((employee) => employee.alias === record.developer)
        let date = moment(record.createdDate.split('/').reverse().join('-'))

        form.setFieldsValue({
            key: record.key,
            developer: developer.key,
            text: record.text,
            createdDate: date,
            rating: record.rating
        })

        setSelectedManager(record.manager)
        setSelectedSupManager(record.sporting_manager)
        setShowAddEditForm(true)
    }

    const deleteRecord = (record) => {
        deleteReviewMutate(record)
    }

    const items = (record) => {
        return [
            {
                key: '2',
                label: (
                    <a onClick={() => editRecord(record)}>
                        Edit
                    </a>
                )
            },
            {
                key: '3',
                label: (
                    <Popconfirm
                        title="Are you sure to delete this Review?"
                        onConfirm={() => deleteRecord(record)}
                        onCancel={() => console.log('cancel')}
                        okText="Yes"
                        cancelText="No"
                    >
                        <a>
                            Delete
                        </a>
                    </Popconfirm>
                )
            }
        ]
    };

    const menu = (items) => (
        <Menu items={items} />
    );

    const columns = [
        {
            title: 'ID',
            dataIndex: 'key',
            key: 'key',
            width: '5%',
            ...getColumnSearchProps('key'),
            sorter: (a, b) => a.key.length - b.key.length,
            sortDirections: ['descend', 'ascend'],
        },
        {
            title: 'Developer',
            dataIndex: 'developer',
            key: 'developer',
            width: '10%',
            ...getColumnSearchProps('developer'),
            sorter: (a, b) => a.developer.length - b.developer.length,
            sortDirections: ['descend', 'ascend'],
        },
        {
            title: 'Manager',
            dataIndex: 'manager',
            key: 'manager',
            width: '10%',
            ...getColumnSearchProps('status'),
            sorter: (a, b) => a.manager.length - b.manager.length,
            sortDirections: ['descend', 'ascend'],
        },
        {
            title: 'Supporting Manager',
            dataIndex: 'sporting_manager',
            key: 'sporting_manager',
            width: '10%',
            ...getColumnSearchProps('status'),
            sorter: (a, b) => a.sporting_manager.length - b.sporting_manager.length,
            sortDirections: ['descend', 'ascend'],
        },
        {
            title: 'Rating',
            dataIndex: 'rating',
            key: 'rating',
            width: '5%',
            ...getColumnSearchProps('rating'),
            sorter: (a, b) => a.rating.length - b.rating.length,
            sortDirections: ['descend', 'ascend'],
        },
        {
            title: 'Created By',
            dataIndex: 'createdBy',
            key: 'createdBy',
            ...getColumnSearchProps('createdBy'),
            sorter: (a, b) => a.createdBy.length - b.createdBy.length,
            sortDirections: ['descend', 'ascend'],
        },
        {
            title: 'Review Date',
            dataIndex: 'createdDate',
            key: 'createdDate',
            ...getColumnSearchProps('createdDate'),
            sorter: (a, b) => a.createdDate - b.createdDate,
            sortDirections: ['descend', 'ascend'],
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Dropdown overlay={menu(items(record))}>
                    <a onClick={e => e.preventDefault()}>
                        <Space>
                            Actions
                            <DownOutlined />
                        </Space>
                    </a>
                </Dropdown>
            )
        },
    ];


    const submitReviews = (values) => {
        console.log(values)
        if (values.key) {
            editReviewMutate(values)
        } else {
            addReviewMutate(values)
        }
    };

const disabledDate = (current) => {
    // Can not select days before today
    return current > moment().endOf('day');
  };

    const onReset = () => {
        form.resetFields();
        form.setFieldsValue({
            createdDate: moment()
        })
        setSelectedManager('')
        setSelectedSupManager('')
    };

    const navigate = useNavigate()
    useEffect(() => {
        if (!props.token) {
            const isAdmin = localStorage.getItem('isAdmin')
            if (!isAdmin) {
                navigate("/login")
            }
        }

    }, [])

    useEffect(() => {

        if(params) {

            if(params.developer) {
                setShowAddEditForm(true)
                let developer = employeesData?.data?.find((dev) => dev.alias === params.developer)

                if(developer) {
                    form.setFieldsValue({
                        developer: developer.key
                    })
    
                    setSelectedManager(developer.manager_name)
                    setSelectedSupManager(developer.sporting_manager_name)
                }

            }

            if(params.date) {
                form.setFieldsValue({
                    createdDate: moment(params.date.split('-').reverse().join('-'))
                })
            }
        }

    }, [employeesData, params])

    useEffect(() => {
        let filteredData = []

        if(filter && filter.developer && filter.developer.length < 0) {
            filteredData = reviewData?.data
        }

        filteredData = reviewData?.data?.filter((review) => {
            let createdDate = review.createdDate.split('/')[2] + '-' + review.createdDate.split('/')[1] + '-' + review.createdDate.split('/')[0]
            createdDate = moment(createdDate)
            let startDate = moment(filter?.startDate)
            let endDate = moment(filter?.endDate)
            let rating = parseInt(review.rating)
            if (filter.developer && filter.developer.length > 0 && !filter.developer.includes(review.developer)) {
                return false
            } else if (filter.startDate && moment(createdDate).isBefore(startDate)) {
                return false
            } else if (filter.endDate && moment(createdDate).isAfter(endDate)) {
                return false
            } else if (filter.rating && !(rating >= filter.rating[0] && rating <= filter.rating[1])) {
                return false
            }
            return true
        })

        setFilteredData({
            data: filteredData
        })

    }, [filter])

    const layout = {
        labelCol: { span: 7 },
        wrapperCol: { span: 14 },
    };

    const handleFilterSelect = (e, type) => {
        // filter based on type and selected value. filter data and set it to table data state
        setFilter({
            developer: type === 'developer' ? e : filter.developer,
            startDate: type === 'startDate' ? e : filter.startDate,
            endDate: type === 'endDate' ? e : filter.endDate,
            rating: type === 'rating' ? e : filter.rating
        })
    }

    return (
        <div>
            {contextHolder}
            <div className="flex justify-between">
                <h1>Reviews Report</h1>
            </div>
            <div>
                <h3 className="mt-5">Filters</h3>
                <div className="flex justify-start flex-row">
                    <label className=" mr-1">Developer:</label>
                    <Select
                        mode="multiple"
                        className="w-1/4"
                        placeholder="Filter by Developer"
                        onChange={(e) => handleFilterSelect(e, 'developer')}
                        allowClear
                    >
                        {
                            employeesData?.data?.map((dev, key) => (
                                <Option key={dev.key} value={dev.alias}>{dev.alias}</Option>
                            ))
                        }
                    </Select>
                    
                    <label  className="ml-5 mr-1">Start Date:</label>
                    <DatePicker defaultValue={moment()} onChange={(e) => handleFilterSelect(e, 'startDate')} />

                    <label className="ml-5 mr-1">End Date:</label>
                    <DatePicker defaultValue={moment()} onChange={(e) => handleFilterSelect(e, 'endDate')} />

                    <label className="ml-5 mr-1">Ratings:</label>
                    <Slider range defaultValue={[3, 4]} max={5}  min={1} disabled={false} style={{ width: '200px' }} onChange={(e) => handleFilterSelect(e, 'rating')} />


                </div>
            </div>
            {
                !showAddEditForm && (
                    <Table columns={columns} dataSource={filteredData?.data} className="mt-5" />
                )
            }
        </div>
    )
}

const mapStateToProps = state => {
    return {
        token: state.appState.token,
    }
}

const mapDispatchToProps = dispatch => {
    return {

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ReviewsReportAdmin)