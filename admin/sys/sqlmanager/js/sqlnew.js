daLoader.in("daUI");
daLoader.in("daWin");
daLoader.in("daIframe");
daLoader.in("daTreeView");
daLoader.in("daToolbar");
daLoader.in("daTable");
daLoader.in("daExcel");
daLoader.in("daMsg");

var _sqlname = "",
	_typeid = "",
	_typename = "";
	
daLoader(function(){
	da(function(){
		daUI();
		
		var p = da.urlParams();
		_typeid = p.typeid;
		_typename = da.toStr(p.typename);
		_sqlname = da.toStr(p.sqlname);
		
		da("#typename").html(_typename);
		
		loadToolBar();
		if( "" != _sqlname ){
			loadInfo();
		}
	});

});

var _toolCode;
/**加载工具条
*/
function loadToolBar(){
	_toolCode = daToolbar({
		id: "toolbar2",
		parent: "#toolbar_code"
	});
	_toolCode.appendItem({
		id: "bt_view",
		html: "代码",
		click: function(){
			da("#editPad").hide();
			da("#codePad").show();
		}
	});
	_toolCode.appendItem({
		id: "bt_edit",
		html: "编辑",
		click: function(){
			da("#editPad").show();
			da("#codePad").hide();
		}
	});
	_toolCode.select("bt_view");
	
}

/**加载信息
*/
function loadInfo(){
	da.getData("/admin/sys/easysql.aspx",{
		db: "daSystem",
		sqlname: "pub_sql",
		opt: "query",
		sql_name: da.toHex(_sqlname)
		
	},function( iseof, data, dsname ){
		if( !iseof ){
			for( var fld in data ){
				if( "sql_params" == fld ){
					showParams( data[fld] );
				}
				else if( "sql_text" == fld ){
					da("#code").html( data[fld] );
					//SyntaxHighlighter.config.clipboardSwf = 'scripts/clipboard.swf';
					//SyntaxHighlighter.all();
					SyntaxHighlighter.highlight();
					
					da.setValue( "#"+fld, data[fld] );
				}
				else{
					da.setValue( "#"+fld, data[fld] );
				}
			}
		}
		else if( !dsname ){
			autoframeheight();
		}
		
	},function( msg ){
		alert(msg);
	});
}

/**显示参数列表数据项
*/
function showParams( strParams ){
	var arrParams = strParams.split("|"),
		arr;
	
	for( var i=0, len=arrParams.length; i<len; i++ ){
		arr = arrParams[i].split(",");
		newItem(arr[0], arr[1], arr[2]);
	}
}

/**添加参数项
*/
function newItem( pname, ptype, plength ){
	var itemObj = document.createElement("li");
	itemObj.className = "paramItem";
	
	var arrHTML = [],
		arrType = "varchar,nvarchar,char,nchar,text,ntext,int,float,bigint,smallint,tinyint,bit,decimal,numeric,\
	datetime,smalldatetime,money,smallmoney,binary,real,image,\
	sql_variant,timestamp,uniqueidentifier,varbinary,xml".split(",");
	
	arrHTML.push('<input type="text" name="pname" class="editLine" value="'+ (pname?pname:'@') +'"/>&nbsp;&nbsp;');
	arrHTML.push('<select name="ptype" style="width:120px;">');
	
	for( var i=0,len = arrType.length; i<len; i++ ){
		arrHTML.push('<option value="'+ arrType[i] +'">'+ arrType[i] +'</option>');
	}
	
	arrHTML.push('</select>&nbsp;&nbsp;');
	arrHTML.push('<input type="text" name="plength" class="editLine" style="width:50px;" value="'+ (plength?plength:'') +'"/>');
	
	itemObj.innerHTML = arrHTML.join("");
	
	document.getElementById("paramList").insertBefore( itemObj, null );
	
	daSelect.convert(da( "select", itemObj ).dom[0]).value( ptype );
}

/**集成参数列表数据项
*/
function getParams(){
	var pname = "",
		arrParams = [], 
		arr;
	
	da(".paramItem").each(function(){
		pname = da("[name=pname]", this).val();
		
		if( "" == pname.trim() || 
		"" == pname.replace("@","").trim() || 
		0 != pname.indexOf("@") ){
			return;
		}
		
		arr = [];
		arr.push( da("[name=pname]", this).val() );
		arr.push( da("[name=ptype]", this).val() );
		arr.push( da("[name=plength]", this).val() );
		
		arrParams.push( arr.join(",") );
	});
	
	return arrParams.join("|");
}


/**保存自定义SQL
*/
function save(){
	da.getData("/admin/sys/easysql.aspx",{
		db: "daSystem",
		sqlname: "pub_sql",
		opt: "" == _sqlname ? "insert" : "update",
		sql_name: da.toHex(da("#sql_name").val()),
		sql_text: da.toHex(da("#sql_text").val()),
		sql_params: getParams(),
		sql_remark: da.toHex(da("#sql_remark").val()),
		
		sql_ispage: daOption.get("#sql_ispage").check(),
		sql_isallcmd: daOption.get("#sql_isallcmd").check()
		
	},function(data){
		if( 0 == data.indexOf("error:") ){
			alert(data);
		}
		else{
			alert("保存成功");
		}
	},function(msg){
		alert(msg);
	});
}
