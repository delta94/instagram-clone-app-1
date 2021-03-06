import React, { useState, useEffect, useMemo } from 'react';
import './AddPostModal.css';
import { Button, message, Input, Upload } from 'antd';
import { CloseOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { getBase64, beforeUpload } from '../../utils';
import { messages, status } from '../../config/globals';
import { sendNewPost } from '../../services/post';
import { useDispatch } from '../../hooks/useDispatch'
import { addPosts } from '../../store/actions';

const dummyRequest = ({ onSuccess }) => {
	setTimeout(() => {
		onSuccess("ok")
	}, 0);
  };


export const AddPostModal = ({ close, user, token }) => {
	const dispatch = useDispatch()
	const [ post, setPost ] = useState({
		byUser: '',
		caption: '',
        imageUrl: '',
	});
	const isValidPost = useMemo(() => {
		const { byUser, caption, imageUrl } = post
		if(!byUser || !caption || !imageUrl) return false
		return true
	}, [post])
	const [ loading, setLoading ] = useState({ upload: false, request: false });
	useEffect(
		() => {
			if (user) {
				setPost((post) => ({ ...post, byUser: user._id }));
			}
		},
		[ user ]
	);
	const onChangePost = (key, value) => setPost({ ...post, [key]: value });

	const handleChangeImageUrl = (info, b, c) => {
		const {status, originFileObj} = info.file
		console.log(status)
		if (status === 'error') {
			setLoading({ ...loading, upload: false });
			message.error('upload ảnh thất bại')
		}
		if (status === 'uploading') {
			setLoading({ ...loading, upload: true });
			return;
		}
		if (status === 'done') {
			// Get this url from response in real world.
			getBase64(originFileObj, (imageUrl) => {
				onChangePost('imageUrl', imageUrl);
				setLoading({ ...loading, upload: false });
			});
		}
    };
    
    const addPost = () => {
		setLoading({...loading, request: true})
		sendNewPost(post, token, user)
		.then(res => {
			message[res.status](res.message)
			setLoading({...loading, request: false})
			dispatch(addPosts([res.post], true))
			close()
		}).catch(({ status: statusError = status.error, message: messageError = messages.action.failed }) => {
			setLoading({...loading, request: false})
			message[statusError](messageError)
		})
    }

    const uploadButton = (
        <div className="upload-button">
            {loading.upload ? <LoadingOutlined /> : <PlusOutlined />}
            <div className="ant-upload-text">Upload</div>
        </div>
	);
    
	return (
		<div className="add-post-modal d-flex-center">
			<div className="card d-flex flex-column">
				<div className="card__title d-flex justify-between">
					<span>Tạo bài viết</span>
					<span className="pointer" onClick={close}>
						<CloseOutlined />
					</span>
				</div>
				<div className="card__content">
					<div className="upload-img d-flex-center" >
                        <Upload
                            name="avatar"
                            listType="picture-card"
                            className="avatar-uploader"
							showUploadList={false} 
							customRequest={dummyRequest}
                            beforeUpload={(file) => beforeUpload(file, message)}
                            onChange={handleChangeImageUrl}
                        >
                            {post.imageUrl ? (
                                <img src={post.imageUrl} alt="avatar" style={{ width: '100%' }} />
                            ) : (
                                uploadButton
                            )}
                        </Upload>
                    </div>
					<div className="caption-area">
						<Input.TextArea
                            allowClear 
							style={{ border: 'none' }}
							placeholder="Bạn đang nghĩ gì?"
							onChange={({ target: { value } }) => onChangePost('caption', value)}
							value={post.caption}
							autoSize={{ maxRows: 4 }}
						/>
					</div>
				</div>
				<div className="card__footer">
					<Button 
					loading={loading.request}
					disabled={!isValidPost}
					onClick={addPost} style={{ width: '100%' }} type="primary">
						Đăng
					</Button>
				</div>
			</div>
		</div>
	);
};
