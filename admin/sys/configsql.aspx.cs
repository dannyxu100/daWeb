using System;
using System.Collections;
using System.Configuration;
using System.Data;
using System.Linq;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.HtmlControls;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Xml.Linq;

//引用
using System.Text;
using System.Data.SqlClient;
using System.Collections.Generic;
using daDB;

public partial class admin_sys_configsql : System.Web.UI.Page
{
    private DBHelper_SQL _dbhelper;         //数据库操作对象
    private string _sqlname;                //参数变量
    private string _sqltext;                //sql代码语句

    /*参数说明
     * sqlname:     数据库表名、自定义sql代码名、存储过程名等
     * 
     * order:       查询操作时sql需要排序的order by参数（,分隔）
     * returntext:  查询结果为单值
     * 
     * qry:         查询分页数据时，是否需要统计总记录数(1 == qry时需要统计)
     * pagesize:    查询分页数据时，每页记录数
     * pageindex:   查询分页数据时，第几页（从1开始）
     * 
     */
    //测试地址 http://localhost/admin/sys/configsql.aspx?db=daSystem&sqlname=slt_pubstree&tag=SqlManager&returntext=
    protected void Page_Load(object sender, EventArgs e)
    {
        if (null != Request["db"])
        {
            _dbhelper = new DBHelper_SQL(Request["db"].ToString());
        }
        else
        {
            _dbhelper = new DBHelper_SQL();
        }

        if (null == Request["sqlname"])              //(1)数据库表名。(2)自定义sql代码名称。
        {
            return;
        }
        else
        {
            _sqlname = Request["sqlname"].ToString().ToLower();
        }

        DataSet ds = new DataSet();
        ds = getConfigData();
        //Functions.nonull2(ds);

        if (null != ds)
        {
            if (Request["qry"] != null && Request["pagesize"] != null && Request["pageindex"] != null)
            {
                Response.ContentType = "text/xml";
                //Functions.nonull2(ds);
                ds.WriteXml(Response.OutputStream);
            }
            else
            {
                if ( Request["returntext"] != null )
                {
                    string rtnval = String.Empty;
                    if (ds.Tables[0].Rows.Count > 0)
                    {
                        rtnval = ds.Tables[0].Rows[0][0].ToString();
                    }
                    Response.Write(rtnval);
                }
                else
                {
                    Response.ContentType = "text/xml";
                    ds.WriteXml(Response.OutputStream);
                }
            }
        }
        else
        {
            Response.Write("error:" + _dbhelper._sError);
        }

        Response.End();
    }

    private DataSet getConfigData()
    {
        DBHelper_SQL dbhelper2 = new DBHelper_SQL("daSystem");
        DataSet ds = new DataSet();

        dbhelper2.OpenDB();
        ds = dbhelper2.getDataSet("select * from pub_sql where sql_name = '" + _sqlname + "'");
        dbhelper2.CloseDB();

        if (ds.Tables[0].Rows.Count <= 0) return null;

        bool ispage = Convert.ToBoolean(ds.Tables[0].Rows[0]["sql_ispage"]);                //提取配置信息是否需要包裹分页代码
        bool isallcmd = Convert.ToBoolean(ds.Tables[0].Rows[0]["sql_isallcmd"].ToString()); //提取配置信息是否是完整代码

        bool isJustPage = false;                //是否提交了需要包裹分页代码的必要参数
        if (true == ispage &&
            Request["qry"] != null &&
            Request["pagesize"] != null &&
            Request["pageindex"] != null)
        {
            if ( null == Request["order"] ) 
            {
                Response.Write("error:查询分页数据，需要提交order by 参数");
                Response.End();
            }
            isJustPage = true;
        }


        _sqltext = ds.Tables[0].Rows[0]["sql_text"].ToString().ToLower();                   //提取配置信息的sql代码

        List<SqlParameter> arrParam = new List<SqlParameter>();   //sql参数
        SqlParameter param;
        string[] paramlist = ds.Tables[0].Rows[0]["sql_params"].ToString().ToLower().Split('|');    //提取配置信息的sql参数
        string[] paraminfo;

        for (int i = 0; i < paramlist.Length; i++)
        {
            if (paramlist[i] == "") { continue; }           //配置信息异常，直接跳过

            paraminfo = paramlist[i].Split(',');

            if (_sqltext.IndexOf(paraminfo[0]) < 0)
            {
                continue;
            }

            param = new SqlParameter();
            param.SqlDbType = _dbhelper.mapDBType(paraminfo[1]);
            param.ParameterName = paraminfo[0];
            if (Request[paraminfo[0].Substring(1)] != null)
            {
                param.Value = Functions.tostr( Request[paraminfo[0].Substring(1)].ToString() );
            }
            //else
            //{
            //    param.Value = "";
            //}

            switch (paraminfo[1].ToLower())
            {
                case "varchar":
                case "nvarchar":
                case "nchar":
                case "char":
                    {
                        if (paraminfo.Length > 2 && paraminfo[2] != "")
                        {
                            param.Size = Convert.ToInt32(paraminfo[2]);
                        }
                        break;
                    }
                case "decimal":
                    {
                        param.Precision = (byte)18;
                        param.Scale = (byte)8;
                        break;
                    }
            }
            arrParam.Add(param);
        }


        _dbhelper.OpenDB();
        DataSet dsNew = new DataSet();

        //如果是分页;
        if (isJustPage)
        {
            string order = Request["order"].ToString().Trim();
            _sqltext += " order by " + order;

            dsNew = _dbhelper.getPage(
                _sqltext.ToString(),
                order,
                arrParam,
                Convert.ToBoolean("1" == Request["qry"].ToString()),
                Convert.ToInt32(Request["pagesize"].ToString()),
                Convert.ToInt32(Request["pageindex"].ToString()));
        }
        else 
        {
            dsNew = _dbhelper.getDataSet(_sqltext, arrParam.ToArray());
        }

        _dbhelper.CloseDB();
        return dsNew;
    }
}
