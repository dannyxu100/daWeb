<%@ Page Language="C#" AutoEventWireup="true"  CodeFile="Default.aspx.cs" Inherits="_Default" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head id="Head1" runat="server">
    <title>无标题页</title>
    <script src="js/daLoader_source.js" type="text/javascript"></script>
    
    
    <style>
        #menubar { width:900px; height:34px; margin:2px auto; padding:10px; border:1px solid #f0f0f0; background-color:#f7f7f7; }
        #menubar .logo { float:left; padding:5px 50px; font-size:23px; line-height:23px; color:#c00 }
        #menubar .item { display:block; float:left; margin-left:-1px; padding: 5px 10px; border:1px solid #eee; background-color:#fff; font-size:14px; text-decoration:none; color:#444; }
        #menubar .item:hover { background-color:#666; color:#f7f7f7; border-color:#000; }
    </style>
    
    <script>
        daLoader("da,daDrag", function(){
            //da.out("加载成功");
        
            da(function(){
                da("#menubar").append('<a class="item" href="#">首页</a><a class="item" href="#">公司简介</a><a class="item" href="#">产品发布</a><a class="item" href="#">客户联系</a>');
                
            });
        });
    </script>
</head>
<body>
    <div id="menubar" ><div class="logo">肥螳螂</div></div>
    
    <div style="width:900px; height:500px; margin:4px auto; padding:10px; border:1px solid #f0f0f0;">
        <div style="height:300px; margin-bottom:10px; border:1px solid #eee; background-color:#f7f7f7;"></div>
        <div style="height:220px; border:0px solid #666;">
            <div style="float:left; width:220px; height:160px; margin:10px; border:1px solid #eee; background-color:#f7f7f7;"></div>
            <div style="float:left; width:220px; height:160px; margin:10px; border:1px solid #eee; background-color:#f7f7f7;"></div>
            <div style="float:left; width:220px; height:160px; margin:10px; border:1px solid #eee; background-color:#f7f7f7;"></div>
        </div>
    </div>
</body>
</html>