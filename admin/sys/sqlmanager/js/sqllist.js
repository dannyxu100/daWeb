daLoader.in("daTreeView");
daLoader.in("daToolbar");
daLoader.in("daWin");
daLoader.in("daTable");
daLoader.in("daMsg");

daLoader(function(){
	da(function(){
		//alert("page ready");
		loadToolBar();
		loadTree();
		
	});

});

var _toolbarObj;
/**加载工具条
*/
function loadToolBar(){
	_toolbarObj = daToolbar({
		id: "toolbar1",
		parent: "#tools",
		showCurrent: false
	});
	
	_toolbarObj.appendItem({
		id: "bt_new",
		html: "<span class='daIco2 add'></span>新建SQL",
		click: function(){
			var obj = _tree.getSelected();
			if( !obj ) {
				alert("请先选择分类");
				return;
			}
		
			daWin({
				url: "/admin/sys/sqlmanager/sqlnew.htm?typename="+da.toHex(obj.node.setting.name) +"&typeid="+obj.node.setting.id,
				title: "添加新自定义SQL",
				width: 800,
				height: 600,
				modal: true
			});
		}
	});
	
}

var _tree;
/**加载目录树
*/
function loadTree(){
	_tree = daTreeView({
		parent: "#mydatree",
		id: "0", 
		name: "SQL管理",
		isLocked: false,
		// checkbox: function( node, nodeObj ){
			// da.out( node.setting.id )
		// }, 
		click: function( node, nodeObj ){
			loadlist( node.setting.id );
		},
		
		append: function( node, nodeObj, textObj, fn ){
			da.getData("/admin/sys/easysql.aspx",{
				db: "daSystem",
				sqlname: "pub_tree",
				opt: "insert",
				t_id: "",
				t_pid: node.setting.id,
				t_tag: "SqlManager",
				t_name: "新类别"
				
			},function( data ){
				if(0 !== data.indexOf("error:")){
					_tree.add({id:data, pid:node.setting.id, name:"新类别"});
					fn();
				}
			},function( msg, code, content ){
				da.out( msg );
			});
		},
		
		remove: function( node, nodeObj, textObj, fn ){
			da.getData("/admin/sys/easysql.aspx",{
				db: "daSystem",
				sqlname: "pub_tree",
				opt: "delete",
				t_id: node.setting.id
				
			},function( data ){
				if(0 !== data.indexOf("error:")){
					fn();
				}
			},function( msg, code, content ){
				da.out( msg );
			});
		},
		
		edit: function( node, nodeObj, textObj, editObj, fn ){
			da.getData("/admin/sys/easysql.aspx",{
				db: "daSystem",
				sqlname: "pub_tree",
				opt: "update",
				t_id: node.setting.id,
				t_name: editObj.value
				
			},function( data ){
				if(0 !== data.indexOf("error:")){
					fn();
				}
			},function( msg, code, content ){
				da.out( msg );
			});
		}
	});
	_tree.expandAll();

	da.getData("/admin/sys/easysql.aspx",{
		db: "daSystem",
		sqlname: "pub_tree",
		opt: "query",
		t_tag: "SqlManager",
		order: "t_id asc"
		
	},function( iseof, data, dsname ){
		if(!iseof){
			_tree.add({id:data.t_id, pid:data.t_pid, name:data.t_name, data:100});
		}
		else if( !dsname ){
			_tree.expandAll();
		}
	},function( msg, code, content ){
		alert( msg )
	});
}

/**加载右侧列表
*/
function loadlist( tag ){
	daTable({
		id: "#tb_list",
		url: "/admin/sys/easysql.aspx",
		data: {
			db: "daSystem",
			sqlname: "pub_sql",
			opt: "query",
			sql_tag: tag
		},
		field: function( fld, val, row, ds ){
			if( "sql_name" == fld )
				return '<a href="javascript:void(0);" onclick="showdetail(\''+ val +'\');" >'+ val +'</a>';
			if( "sql_ispage" == fld )
				return 0 == val?"完整SQL":"不完整SQL";
			return da.isNull( val, "&nbsp;" );
		},
		loaded: function( idx, xml, json, ds ){
			link_click("#tb_list tbody[name=details_auto] tr");
		}
		
	}).load();
	
}

/**显示SQL配置信息
*/
function showdetail( sqlname ){
	var obj = _tree.getSelected();
	
	var str = "/admin/sys/sqlmanager/sqlnew.htm";
	str += "?typename="+da.toHex(obj.node.setting.name);
	str += "&typeid="+da.toHex(obj.node.setting.id);
	str += "&sqlname="+da.toHex(sqlname);

	daWin({
		url: str,
		title: "查看自定义SQL配置信息",
		width: 800,
		height: 600,
		modal: true
	});
	
}
